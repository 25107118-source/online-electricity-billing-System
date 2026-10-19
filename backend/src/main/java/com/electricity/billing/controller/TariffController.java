package com.electricity.billing.controller;

import com.electricity.billing.dto.TariffSlabDto;
import com.electricity.billing.entity.ConnectionType;
import com.electricity.billing.service.TariffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariffs")
public class TariffController {

    private final TariffService tariffService;

    public TariffController(TariffService tariffService) {
        this.tariffService = tariffService;
    }

    @GetMapping
    public ResponseEntity<List<TariffSlabDto>> getAllTariffs() {
        return ResponseEntity.ok(tariffService.getAllTariffs());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<TariffSlabDto>> getTariffsByType(@PathVariable ConnectionType type) {
        return ResponseEntity.ok(tariffService.getActiveTariffsByType(type));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TariffSlabDto> createTariff(@Valid @RequestBody TariffSlabDto dto) {
        return new ResponseEntity<>(tariffService.createTariffSlab(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TariffSlabDto> updateTariff(@PathVariable Long id, @Valid @RequestBody TariffSlabDto dto) {
        return ResponseEntity.ok(tariffService.updateTariffSlab(id, dto));
    }
}
