package com.electricity.billing.controller;

import com.electricity.billing.dto.ConnectionDto;
import com.electricity.billing.entity.ConnectionStatus;
import com.electricity.billing.service.ConnectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @GetMapping
    public ResponseEntity<List<ConnectionDto>> getConnections(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(connectionService.getAllConnections());
        } else {
            return ResponseEntity.ok(connectionService.getConnectionsByConsumerNumber(auth.getName()));
        }
    }

    @GetMapping("/consumer/{consumerNumber}")
    public ResponseEntity<List<ConnectionDto>> getConnectionsByConsumerNumber(@PathVariable String consumerNumber, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !auth.getName().equals(consumerNumber)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(connectionService.getConnectionsByConsumerNumber(consumerNumber));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConnectionDto> getConnectionById(@PathVariable Long id) {
        return ResponseEntity.ok(connectionService.getConnectionById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConnectionDto> createConnection(@Valid @RequestBody ConnectionDto dto) {
        return new ResponseEntity<>(connectionService.createConnection(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConnectionDto> updateStatus(@PathVariable Long id, @RequestParam ConnectionStatus status) {
        return ResponseEntity.ok(connectionService.updateConnectionStatus(id, status));
    }
}
