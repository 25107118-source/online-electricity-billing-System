package com.electricity.billing.controller;

import com.electricity.billing.dto.ConsumerDto;
import com.electricity.billing.entity.User;
import com.electricity.billing.exception.BadRequestException;
import com.electricity.billing.repository.UserRepository;
import com.electricity.billing.service.ConsumerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consumers")
public class ConsumerController {

    private final ConsumerService consumerService;
    private final UserRepository userRepository;

    public ConsumerController(ConsumerService consumerService, UserRepository userRepository) {
        this.consumerService = consumerService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ConsumerDto>> getAllConsumers(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(consumerService.getAllConsumers(search));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsumerDto> getConsumerById(@PathVariable Long id) {
        return ResponseEntity.ok(consumerService.getConsumerById(id));
    }

    @GetMapping("/by-number/{consumerNumber}")
    public ResponseEntity<ConsumerDto> getConsumerByNumber(@PathVariable String consumerNumber, Authentication auth) {
        // Consumer can only access their own number
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !auth.getName().equals(consumerNumber)) {
            throw new BadRequestException("Access denied: You can only view your own consumer records");
        }
        return ResponseEntity.ok(consumerService.getConsumerByNumber(consumerNumber));
    }

    @GetMapping("/me")
    public ResponseEntity<ConsumerDto> getCurrentConsumer(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BadRequestException("User profile not found"));
        if (user.getConsumerNumber() == null) {
            throw new BadRequestException("Logged in user is not associated with a consumer account");
        }
        return ResponseEntity.ok(consumerService.getConsumerByNumber(user.getConsumerNumber()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsumerDto> createConsumer(@Valid @RequestBody ConsumerDto dto) {
        return new ResponseEntity<>(consumerService.createConsumer(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsumerDto> updateConsumer(@PathVariable Long id, @Valid @RequestBody ConsumerDto dto) {
        return ResponseEntity.ok(consumerService.updateConsumer(id, dto));
    }
}
