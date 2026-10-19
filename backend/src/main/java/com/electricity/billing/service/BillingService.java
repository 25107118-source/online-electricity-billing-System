package com.electricity.billing.service;

import com.electricity.billing.dto.BillDto;
import com.electricity.billing.dto.BillGenerationRequest;
import com.electricity.billing.entity.*;
import com.electricity.billing.exception.BadRequestException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.ConnectionRepository;
import com.electricity.billing.repository.MeterReadingRepository;
import com.electricity.billing.repository.TariffSlabRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final ConnectionRepository connectionRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final TariffSlabRepository tariffSlabRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BillingService(BillRepository billRepository,
                          ConnectionRepository connectionRepository,
                          MeterReadingRepository meterReadingRepository,
                          TariffSlabRepository tariffSlabRepository) {
        this.billRepository = billRepository;
        this.connectionRepository = connectionRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.tariffSlabRepository = tariffSlabRepository;
    }

    public List<BillDto> getAllBills(String consumerNumber, String billingMonth, BillStatus status) {
        return billRepository.searchBills(consumerNumber, billingMonth, status)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<BillDto> getBillsByConsumerNumber(String consumerNumber) {
        return billRepository.findByConsumerConsumerNumberOrderByBillDateDesc(consumerNumber)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public BillDto getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
        return mapToDto(bill);
    }

    public BillDto getBillByNumber(String billNumber) {
        Bill bill = billRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with number: " + billNumber));
        return mapToDto(bill);
    }

    @Transactional
    public BillDto generateBill(BillGenerationRequest request) {
        Connection connection = connectionRepository.findById(request.getConnectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found with id: " + request.getConnectionId()));

        String billingMonth = request.getBillingMonth();
        if (billingMonth == null || !billingMonth.matches("^\\d{4}-\\d{2}$")) {
            throw new BadRequestException("Invalid billing month format. Expected YYYY-MM");
        }

        // Prevent duplicate bills for same connection and month
        if (billRepository.existsByConnectionIdAndBillingMonth(connection.getId(), billingMonth)) {
            throw new BadRequestException("A bill has already been generated for connection " 
                    + connection.getConnectionNumber() + " for month " + billingMonth);
        }

        // Look for meter reading for this connection and billing month
        MeterReading meterReading = meterReadingRepository.findByConnectionIdAndBillingMonth(connection.getId(), billingMonth)
                .orElseThrow(() -> new BadRequestException("No meter reading found for connection " 
                        + connection.getConnectionNumber() + " in month " + billingMonth 
                        + ". Please record the meter reading first."));

        BigDecimal unitsConsumed = meterReading.getUnitsConsumed();

        // Retrieve active tariff slabs for this connection type
        List<TariffSlab> slabs = tariffSlabRepository.findByConnectionTypeAndActiveTrueOrderByFromUnitAsc(connection.getConnectionType());
        if (slabs.isEmpty()) {
            throw new BadRequestException("No active tariff slabs configured for connection type: " + connection.getConnectionType());
        }

        // Calculate Progressive Slab Charges
        BigDecimal energyCharges = BigDecimal.ZERO;
        BigDecimal fixedCharge = slabs.get(0).getFixedCharge();
        List<Map<String, Object>> slabBreakdown = new ArrayList<>();

        double remainingUnits = unitsConsumed.doubleValue();

        for (TariffSlab slab : slabs) {
            if (remainingUnits <= 0) break;

            int from = slab.getFromUnit();
            Integer to = slab.getToUnit();
            double slabCapacity = (to == null) ? Double.MAX_VALUE : (to - from + (from == 0 ? 0 : 1));

            // In our standard 0-100, 101-200 slab representation:
            if (from == 0 && to != null) {
                slabCapacity = to.doubleValue();
            } else if (to != null) {
                slabCapacity = (to - from + 1);
            }

            double unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
            BigDecimal slabUnits = BigDecimal.valueOf(unitsInThisSlab).setScale(2, RoundingMode.HALF_UP);
            BigDecimal slabAmount = slabUnits.multiply(slab.getRatePerUnit()).setScale(2, RoundingMode.HALF_UP);

            energyCharges = energyCharges.add(slabAmount);
            remainingUnits -= unitsInThisSlab;

            Map<String, Object> slabRecord = new LinkedHashMap<>();
            slabRecord.put("from", slab.getFromUnit());
            slabRecord.put("to", slab.getToUnit());
            slabRecord.put("rate", slab.getRatePerUnit());
            slabRecord.put("units", slabUnits);
            slabRecord.put("amount", slabAmount);
            slabBreakdown.add(slabRecord);
        }

        Map<String, Object> tariffAudit = new LinkedHashMap<>();
        tariffAudit.put("slabs", slabBreakdown);
        tariffAudit.put("fixedCharge", fixedCharge);
        String tariffJson = "";
        try {
            tariffJson = objectMapper.writeValueAsString(tariffAudit);
        } catch (Exception ignored) {
        }

        BigDecimal otherCharges = request.getOtherCharges() != null ? request.getOtherCharges() : BigDecimal.ZERO;
        BigDecimal lateFee = request.getLateFee() != null ? request.getLateFee() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;

        // Total Bill = Energy Charge + Fixed Charge + Other Charges + Late Fee - Discount
        BigDecimal totalAmount = energyCharges
                .add(fixedCharge)
                .add(otherCharges)
                .add(lateFee)
                .subtract(discount)
                .setScale(2, RoundingMode.HALF_UP);

        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        LocalDate billDate = request.getBillDate() != null ? request.getBillDate() : LocalDate.now();
        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : billDate.plusDays(20);

        // Generate unique bill number: BILL-YYYYMM-XXXX
        long count = billRepository.count() + 1;
        String billNumber = String.format("BILL-%s-%04d", billingMonth.replace("-", ""), count);

        Bill bill = new Bill(
                billNumber,
                connection,
                connection.getConsumer(),
                meterReading,
                billingMonth,
                billDate,
                dueDate,
                unitsConsumed,
                energyCharges,
                fixedCharge,
                otherCharges,
                lateFee,
                discount,
                totalAmount,
                totalAmount, // initial balance amount equals total amount
                BillStatus.UNPAID,
                tariffJson
        );

        bill = billRepository.save(bill);
        return mapToDto(bill);
    }

    public BillDto mapToDto(Bill b) {
        BillDto dto = new BillDto();
        dto.setId(b.getId());
        dto.setBillNumber(b.getBillNumber());

        dto.setConnectionId(b.getConnection().getId());
        dto.setConnectionNumber(b.getConnection().getConnectionNumber());
        dto.setConnectionType(b.getConnection().getConnectionType());
        dto.setMeterNumber(b.getConnection().getMeterNumber());
        dto.setSanctionedLoadKw(b.getConnection().getSanctionedLoadKw());

        dto.setConsumerId(b.getConsumer().getId());
        dto.setConsumerNumber(b.getConsumer().getConsumerNumber());
        dto.setConsumerName(b.getConsumer().getFullName());
        dto.setConsumerEmail(b.getConsumer().getEmail());
        dto.setConsumerPhone(b.getConsumer().getPhoneNumber());
        dto.setConsumerAddress(b.getConsumer().getAddress());

        dto.setMeterReadingId(b.getMeterReading().getId());
        dto.setBillingMonth(b.getBillingMonth());
        dto.setPreviousReading(b.getMeterReading().getPreviousReading());
        dto.setCurrentReading(b.getMeterReading().getCurrentReading());
        dto.setUnitsConsumed(b.getUnitsConsumed());
        dto.setReadingDate(b.getMeterReading().getReadingDate());

        dto.setBillDate(b.getBillDate());
        dto.setDueDate(b.getDueDate());
        dto.setEnergyCharges(b.getEnergyCharges());
        dto.setFixedCharges(b.getFixedCharges());
        dto.setOtherCharges(b.getOtherCharges());
        dto.setLateFee(b.getLateFee());
        dto.setDiscount(b.getDiscount());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setPaidAmount(b.getPaidAmount());
        dto.setBalanceAmount(b.getBalanceAmount());
        dto.setStatus(b.getStatus());
        dto.setTariffDetailsJson(b.getTariffDetailsJson());
        dto.setCreatedAt(b.getCreatedAt());

        return dto;
    }
}
