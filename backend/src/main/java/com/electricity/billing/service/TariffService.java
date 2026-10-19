package com.electricity.billing.service;

import com.electricity.billing.dto.TariffSlabDto;
import com.electricity.billing.entity.ConnectionType;
import com.electricity.billing.entity.TariffSlab;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.TariffSlabRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TariffService {

    private final TariffSlabRepository tariffSlabRepository;

    public TariffService(TariffSlabRepository tariffSlabRepository) {
        this.tariffSlabRepository = tariffSlabRepository;
    }

    public List<TariffSlabDto> getAllTariffs() {
        return tariffSlabRepository.findAllByOrderByConnectionTypeAscFromUnitAsc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<TariffSlabDto> getActiveTariffsByType(ConnectionType connectionType) {
        return tariffSlabRepository.findByConnectionTypeAndActiveTrueOrderByFromUnitAsc(connectionType)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public TariffSlabDto createTariffSlab(TariffSlabDto dto) {
        TariffSlab slab = new TariffSlab(
                dto.getConnectionType(),
                dto.getFromUnit(),
                dto.getToUnit(),
                dto.getRatePerUnit(),
                dto.getFixedCharge(),
                dto.getEffectiveDate() != null ? dto.getEffectiveDate() : LocalDate.now(),
                dto.isActive()
        );
        slab = tariffSlabRepository.save(slab);
        return mapToDto(slab);
    }

    @Transactional
    public TariffSlabDto updateTariffSlab(Long id, TariffSlabDto dto) {
        TariffSlab slab = tariffSlabRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tariff slab not found with id: " + id));

        slab.setRatePerUnit(dto.getRatePerUnit());
        slab.setFixedCharge(dto.getFixedCharge());
        slab.setFromUnit(dto.getFromUnit());
        slab.setToUnit(dto.getToUnit());
        slab.setActive(dto.isActive());
        if (dto.getEffectiveDate() != null) {
            slab.setEffectiveDate(dto.getEffectiveDate());
        }

        slab = tariffSlabRepository.save(slab);
        return mapToDto(slab);
    }

    private TariffSlabDto mapToDto(TariffSlab s) {
        TariffSlabDto dto = new TariffSlabDto();
        dto.setId(s.getId());
        dto.setConnectionType(s.getConnectionType());
        dto.setFromUnit(s.getFromUnit());
        dto.setToUnit(s.getToUnit());
        dto.setRatePerUnit(s.getRatePerUnit());
        dto.setFixedCharge(s.getFixedCharge());
        dto.setEffectiveDate(s.getEffectiveDate());
        dto.setActive(s.isActive());
        return dto;
    }
}
