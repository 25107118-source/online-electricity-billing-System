package com.electricity.billing.service;

import com.electricity.billing.dto.ConsumerDto;
import com.electricity.billing.entity.Consumer;
import com.electricity.billing.entity.Role;
import com.electricity.billing.entity.User;
import com.electricity.billing.exception.BadRequestException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.ConsumerRepository;
import com.electricity.billing.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsumerService {

    private final ConsumerRepository consumerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ConsumerService(ConsumerRepository consumerRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.consumerRepository = consumerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<ConsumerDto> getAllConsumers(String keyword) {
        List<Consumer> consumers;
        if (keyword != null && !keyword.trim().isEmpty()) {
            consumers = consumerRepository.searchConsumers(keyword.trim());
        } else {
            consumers = consumerRepository.findAll();
        }

        return consumers.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ConsumerDto getConsumerById(Long id) {
        Consumer consumer = consumerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with id: " + id));
        return mapToDto(consumer);
    }

    public ConsumerDto getConsumerByNumber(String consumerNumber) {
        Consumer consumer = consumerRepository.findByConsumerNumber(consumerNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with number: " + consumerNumber));
        return mapToDto(consumer);
    }

    @Transactional
    public ConsumerDto createConsumer(ConsumerDto dto) {
        if (consumerRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("A consumer with email '" + dto.getEmail() + "' already exists");
        }

        // Generate consumer number if not provided
        String consumerNumber = dto.getConsumerNumber();
        if (consumerNumber == null || consumerNumber.trim().isEmpty()) {
            long count = consumerRepository.count() + 1;
            consumerNumber = String.format("CUST%04d", 1000 + count);
        }

        if (consumerRepository.existsByConsumerNumber(consumerNumber)) {
            throw new BadRequestException("Consumer number '" + consumerNumber + "' already exists");
        }

        Consumer consumer = new Consumer(
                consumerNumber,
                dto.getFullName(),
                dto.getPhoneNumber(),
                dto.getEmail(),
                dto.getAddress()
        );

        consumer = consumerRepository.save(consumer);

        // Automatically provision login credentials for consumer (default password 'pass123')
        if (!userRepository.existsByUsername(consumerNumber)) {
            User consumerUser = new User(
                    consumerNumber,
                    passwordEncoder.encode("pass123"),
                    Role.CONSUMER,
                    consumerNumber
            );
            userRepository.save(consumerUser);
        }

        return mapToDto(consumer);
    }

    @Transactional
    public ConsumerDto updateConsumer(Long id, ConsumerDto dto) {
        Consumer consumer = consumerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consumer not found with id: " + id));

        // Check if email changed and taken
        if (!consumer.getEmail().equalsIgnoreCase(dto.getEmail()) && consumerRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email '" + dto.getEmail() + "' is already in use by another consumer");
        }

        consumer.setFullName(dto.getFullName());
        consumer.setPhoneNumber(dto.getPhoneNumber());
        consumer.setEmail(dto.getEmail());
        consumer.setAddress(dto.getAddress());

        consumer = consumerRepository.save(consumer);
        return mapToDto(consumer);
    }

    private ConsumerDto mapToDto(Consumer c) {
        ConsumerDto dto = new ConsumerDto(
                c.getId(),
                c.getConsumerNumber(),
                c.getFullName(),
                c.getPhoneNumber(),
                c.getEmail(),
                c.getAddress(),
                c.getCreatedAt()
        );
        dto.setConnectionCount(c.getConnections() != null ? c.getConnections().size() : 0);
        return dto;
    }
}
