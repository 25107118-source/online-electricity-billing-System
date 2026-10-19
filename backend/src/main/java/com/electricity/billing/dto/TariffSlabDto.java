package com.electricity.billing.dto;

import com.electricity.billing.entity.ConnectionType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TariffSlabDto {

    private Long id;

    @NotNull(message = "Connection type is required")
    private ConnectionType connectionType;

    @NotNull(message = "From unit is required")
    private Integer fromUnit;

    private Integer toUnit;

    @NotNull(message = "Rate per unit is required")
    private BigDecimal ratePerUnit;

    @NotNull(message = "Fixed charge is required")
    private BigDecimal fixedCharge;

    private LocalDate effectiveDate;
    private boolean active = true;

    public TariffSlabDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ConnectionType getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(ConnectionType connectionType) {
        this.connectionType = connectionType;
    }

    public Integer getFromUnit() {
        return fromUnit;
    }

    public void setFromUnit(Integer fromUnit) {
        this.fromUnit = fromUnit;
    }

    public Integer getToUnit() {
        return toUnit;
    }

    public void setToUnit(Integer toUnit) {
        this.toUnit = toUnit;
    }

    public BigDecimal getRatePerUnit() {
        return ratePerUnit;
    }

    public void setRatePerUnit(BigDecimal ratePerUnit) {
        this.ratePerUnit = ratePerUnit;
    }

    public BigDecimal getFixedCharge() {
        return fixedCharge;
    }

    public void setFixedCharge(BigDecimal fixedCharge) {
        this.fixedCharge = fixedCharge;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
