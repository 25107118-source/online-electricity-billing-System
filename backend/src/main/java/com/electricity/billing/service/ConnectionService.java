package com.electricity.billing.service;

import com.electricity.billing.dto.ConnectionDto;
import com.electricity.billing.entity.Connection;
import com.electricity.billing.entity.ConnectionStatus;
import com.electricity.billing.entity.Consumer;
import com.electricity.billing.exception.BadRequestException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.ConnectionRepository;
import com.electricity.billing.repository.ConsumerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final ConsumerRepository consumerRepository;

    public ConnectionService(ConnectionRepository connectionRepository, ConsumerRepository consumerRepository) {
        this.connectionRepository = connectionRepository;
        this.consumerRepository = consumerRepository;
    }

    public List<ConnectionDto> getAllConnections() {
        return connectionRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ConnectionDto> getConnectionsByConsumerId(Long consumerId) {
        return connectionRepository.findByConsumerId(consumerId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ConnectionDto> getConnectionsByConsumerNumber(String consumerNumber) {
        return connectionRepository.findByConsumerConsumerNumber(consumerNumber).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ConnectionDto getConnectionById(Long id) {
        Connection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found with id: " + id));
        return mapToDto(connection);
    }

    @Transactional
    public ConnectionDto createConnection(ConnectionDto dto) {
        Consumer consumer = consumerRepository.findById(dto.getConsumerId())
                .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with id: " + dto.getConsumerId()));

        long count = connectionRepository.count() + 1;
        String connectionNumber = dto.getConnectionNumber();
        if (connectionNumber == null || connectionNumber.trim().isEmpty()) {
            connectionNumber = String.format("CONN-%04d", 1000 + count);
        }

        if (connectionRepository.existsByConnectionNumber(connectionNumber)) {
            throw new BadRequestException("Connection number '" + connectionNumber + "' already exists");
        }

        String meterNumber = dto.getMeterNumber();
        if (meterNumber == null || meterNumber.trim().isEmpty()) {
            meterNumber = String.format("MTR-%05d", 88400 + count);
        }

        if (connectionRepository.existsByMeterNumber(meterNumber)) {
            throw new BadRequestException("Meter number '" + meterNumber + "' is already assigned to another connection");
        }

        LocalDate connDate = dto.getConnectionDate() != null ? dto.getConnectionDate() : LocalDate.now();
        BigDecimal load = dto.getSanctionedLoadKw() != null ? dto.getSanctionedLoadKw() : new BigDecimal("1.00");
        ConnectionStatus status = dto.getStatus() != null ? dto.getStatus() : ConnectionStatus.ACTIVE;

        Connection connection = new Connection(
                connectionNumber,
                consumer,
                dto.getConnectionType(),
                meterNumber,
                load,
                connDate,
                status
        );

        connection = connectionRepository.save(connection);
        return mapToDto(connection);
    }

    @Transactional
    public ConnectionDto updateConnectionStatus(Long id, ConnectionStatus status) {
        Connection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found with id: " + id));
        connection.setStatus(status);
        connection = connectionRepository.save(connection);
        return mapToDto(connection);
    }

    private ConnectionDto mapToDto(Connection c) {
        ConnectionDto dto = new ConnectionDto();
        dto.setId(c.getId());
        dto.setConnectionNumber(c.getConnectionNumber());
        dto.setConsumerId(c.getConsumer().getId());
        dto.setConsumerName(c.getConsumer().getFullName());
        dto.setConsumerNumber(c.getConsumer().getConsumerNumber());
        dto.setConnectionType(c.getConnectionType());
        dto.setMeterNumber(c.getMeterNumber());
        dto.setSanctionedLoadKw(c.getSanctionedLoadKw());
        dto.setConnectionDate(c.getConnectionDate());
        dto.setStatus(c.getStatus());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
