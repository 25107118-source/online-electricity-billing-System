package com.electricity.billing.controller;

import com.electricity.billing.dto.MeterReadingDto;
import com.electricity.billing.service.MeterReadingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meter-readings")
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    public MeterReadingController(MeterReadingService meterReadingService) {
        this.meterReadingService = meterReadingService;
    }

    @GetMapping
    public ResponseEntity<List<MeterReadingDto>> getMeterReadings(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(meterReadingService.getAllReadings());
        } else {
            return ResponseEntity.ok(meterReadingService.getReadingsByConsumerNumber(auth.getName()));
        }
    }

    @GetMapping("/connection/{connectionId}")
    public ResponseEntity<List<MeterReadingDto>> getByConnection(@PathVariable Long connectionId) {
        return ResponseEntity.ok(meterReadingService.getReadingsByConnectionId(connectionId));
    }

    @GetMapping("/previous-reading/{connectionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, BigDecimal>> getPreviousReading(@PathVariable Long connectionId) {
        BigDecimal prev = meterReadingService.getPreviousReading(connectionId);
        return ResponseEntity.ok(Map.of("previousReading", prev));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MeterReadingDto> recordReading(@Valid @RequestBody MeterReadingDto dto, Authentication auth) {
        return new ResponseEntity<>(meterReadingService.recordMeterReading(dto, auth.getName()), HttpStatus.CREATED);
    }
}
