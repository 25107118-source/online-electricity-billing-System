package com.electricity.billing.service;

import com.electricity.billing.dto.PaymentDto;
import com.electricity.billing.dto.PaymentRequest;
import com.electricity.billing.entity.*;
import com.electricity.billing.exception.BadRequestException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;

    public PaymentService(PaymentRepository paymentRepository, BillRepository billRepository) {
        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
    }

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PaymentDto> getPaymentsByConsumerNumber(String consumerNumber) {
        return paymentRepository.findByConsumerConsumerNumberOrderByPaymentDateDesc(consumerNumber)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PaymentDto> getPaymentsByBillId(Long billId) {
        return paymentRepository.findByBillIdOrderByPaymentDateDesc(billId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public PaymentDto getPaymentByReceiptNumber(String receiptNumber) {
        Payment payment = paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Payment receipt not found with number: " + receiptNumber));
        return mapToDto(payment);
    }

    @Transactional
    public PaymentDto recordPayment(PaymentRequest request, String recordedBy) {
        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + request.getBillId()));

        if (bill.getStatus() == BillStatus.PAID) {
            throw new BadRequestException("Bill " + bill.getBillNumber() + " is already fully paid");
        }

        BigDecimal paymentAmount = request.getAmountPaid().setScale(2, RoundingMode.HALF_UP);
        BigDecimal currentBalance = bill.getBalanceAmount();

        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        if (paymentAmount.compareTo(currentBalance) > 0) {
            throw new BadRequestException("Payment amount (₹" + paymentAmount 
                    + ") cannot exceed outstanding balance (₹" + currentBalance + ")");
        }

        // Calculate new paid amount and remaining balance
        BigDecimal newPaidAmount = bill.getPaidAmount().add(paymentAmount);
        BigDecimal newBalance = bill.getTotalAmount().subtract(newPaidAmount);

        bill.setPaidAmount(newPaidAmount);
        bill.setBalanceAmount(newBalance);

        // Update payment status automatically
        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(BillStatus.PAID);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        billRepository.save(bill);

        // Generate unique receipt number: RCPT-YYYYMM-XXXX
        long count = paymentRepository.count() + 1;
        String monthPart = bill.getBillingMonth().replace("-", "");
        String receiptNumber = String.format("RCPT-%s-%04d", monthPart, count);

        Payment payment = new Payment(
                receiptNumber,
                bill,
                bill.getConsumer(),
                paymentAmount,
                request.getPaymentMethod(),
                request.getTransactionRef(),
                request.getNotes(),
                recordedBy != null ? recordedBy : "System"
        );

        payment = paymentRepository.save(payment);
        return mapToDto(payment);
    }

    private PaymentDto mapToDto(Payment p) {
        PaymentDto dto = new PaymentDto();
        dto.setId(p.getId());
        dto.setReceiptNumber(p.getReceiptNumber());
        dto.setBillId(p.getBill().getId());
        dto.setBillNumber(p.getBill().getBillNumber());
        dto.setBillingMonth(p.getBill().getBillingMonth());
        dto.setConsumerId(p.getConsumer().getId());
        dto.setConsumerName(p.getConsumer().getFullName());
        dto.setConsumerNumber(p.getConsumer().getConsumerNumber());
        dto.setMeterNumber(p.getBill().getConnection().getMeterNumber());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setAmountPaid(p.getAmountPaid());
        dto.setBillTotalAmount(p.getBill().getTotalAmount());
        dto.setRemainingBalance(p.getBill().getBalanceAmount());
        dto.setBillStatus(p.getBill().getStatus().name());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setTransactionRef(p.getTransactionRef());
        dto.setNotes(p.getNotes());
        dto.setRecordedBy(p.getRecordedBy());
        return dto;
    }
}
