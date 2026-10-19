package com.electricity.billing.service;

import com.electricity.billing.dto.MeterReadingDto;
import com.electricity.billing.entity.Connection;
import com.electricity.billing.entity.Consumer;
import com.electricity.billing.entity.MeterReading;
import com.electricity.billing.exception.BadRequestException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.ConnectionRepository;
import com.electricity.billing.repository.MeterReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MeterReadingService {

    private final MeterReadingRepository meterReadingRepository;
    private final ConnectionRepository connectionRepository;

    public MeterReadingService(MeterReadingRepository meterReadingRepository, ConnectionRepository connectionRepository) {
        this.meterReadingRepository = meterReadingRepository;
        this.connectionRepository = connectionRepository;
    }

    public List<MeterReadingDto> getAllReadings() {
        return meterReadingRepository.findAllByOrderByReadingDateDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<MeterReadingDto> getReadingsByConsumerNumber(String consumerNumber) {
        return meterReadingRepository.findByConsumerConsumerNumberOrderByReadingDateDesc(consumerNumber)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<MeterReadingDto> getReadingsByConnectionId(Long connectionId) {
        return meterReadingRepository.findByConnectionIdOrderByReadingDateDesc(connectionId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public MeterReadingDto getReadingById(Long id) {
        MeterReading reading = meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meter reading not found with id: " + id));
        return mapToDto(reading);
    }

    public BigDecimal getPreviousReading(Long connectionId) {
        Optional<MeterReading> latest = meterReadingRepository.findLatestByConnectionId(connectionId);
        return latest.map(MeterReading::getCurrentReading).orElse(BigDecimal.ZERO);
    }

    @Transactional
    public MeterReadingDto recordMeterReading(MeterReadingDto dto, String username) {
        Connection connection = connectionRepository.findById(dto.getConnectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found with id: " + dto.getConnectionId()));

        // Prevent duplicate readings for same connection and billing month
        if (meterReadingRepository.existsByConnectionIdAndBillingMonth(connection.getId(), dto.getBillingMonth())) {
            throw new BadRequestException("Meter reading has already been recorded for connection " 
                    + connection.getConnectionNumber() + " in month " + dto.getBillingMonth());
        }

        BigDecimal previousReading = dto.getPreviousReading();
        if (previousReading == null) {
            previousReading = getPreviousReading(connection.getId());
        }

        BigDecimal currentReading = dto.getCurrentReading();
        if (currentReading == null) {
            throw new BadRequestException("Current meter reading is required");
        }

        // Rule: Current reading cannot be less than previous reading
        if (currentReading.compareTo(previousReading) < 0) {
            throw new BadRequestException("Current reading (" + currentReading + 
                    ") cannot be less than previous reading (" + previousReading + ")");
        }

        BigDecimal unitsConsumed = currentReading.subtract(previousReading);
        LocalDate readingDate = dto.getReadingDate() != null ? dto.getReadingDate() : LocalDate.now();

        MeterReading reading = new MeterReading(
                connection,
                connection.getConsumer(),
                dto.getBillingMonth(),
                previousReading,
                currentReading,
                unitsConsumed,
                readingDate,
                username != null ? username : "admin"
        );

        reading = meterReadingRepository.save(reading);
        return mapToDto(reading);
    }

    private MeterReadingDto mapToDto(MeterReading r) {
        MeterReadingDto dto = new MeterReadingDto();
        dto.setId(r.getId());
        dto.setConnectionId(r.getConnection().getId());
        dto.setConnectionNumber(r.getConnection().getConnectionNumber());
        dto.setMeterNumber(r.getConnection().getMeterNumber());
        dto.setConsumerId(r.getConsumer().getId());
        dto.setConsumerName(r.getConsumer().getFullName());
        dto.setConsumerNumber(r.getConsumer().getConsumerNumber());
        dto.setBillingMonth(r.getBillingMonth());
        dto.setPreviousReading(r.getPreviousReading());
        dto.setCurrentReading(r.getCurrentReading());
        dto.setUnitsConsumed(r.getUnitsConsumed());
        dto.setReadingDate(r.getReadingDate());
        dto.setRecordedBy(r.getRecordedBy());
        return dto;
    }
}
