package com.electricity.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tariff_slabs")
public class TariffSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "connection_type", nullable = false, length = 20)
    private ConnectionType connectionType;

    @Column(name = "from_unit", nullable = false)
    private Integer fromUnit;

    @Column(name = "to_unit")
    private Integer toUnit; // null means unbounded (e.g. above 200)

    @Column(name = "rate_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerUnit;

    @Column(name = "fixed_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedCharge;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    private boolean active = true;

    public TariffSlab() {
    }

    public TariffSlab(ConnectionType connectionType, Integer fromUnit, Integer toUnit,
                      BigDecimal ratePerUnit, BigDecimal fixedCharge, LocalDate effectiveDate, boolean active) {
        this.connectionType = connectionType;
        this.fromUnit = fromUnit;
        this.toUnit = toUnit;
        this.ratePerUnit = ratePerUnit;
        this.fixedCharge = fixedCharge;
        this.effectiveDate = effectiveDate;
        this.active = active;
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
