package com.electricity.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meter_readings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"connection_id", "billing_month"})
})
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "connection_id", nullable = false)
    private Connection connection;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Consumer consumer;

    @Column(name = "billing_month", nullable = false, length = 7)
    private String billingMonth; // Format: YYYY-MM (e.g., 2026-03)

    @Column(name = "previous_reading", nullable = false, precision = 10, scale = 2)
    private BigDecimal previousReading;

    @Column(name = "current_reading", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentReading;

    @Column(name = "units_consumed", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitsConsumed;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @Column(name = "recorded_by", nullable = false, length = 50)
    private String recordedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MeterReading() {
    }

    public MeterReading(Connection connection, Consumer consumer, String billingMonth,
                        BigDecimal previousReading, BigDecimal currentReading, BigDecimal unitsConsumed,
                        LocalDate readingDate, String recordedBy) {
        this.connection = connection;
        this.consumer = consumer;
        this.billingMonth = billingMonth;
        this.previousReading = previousReading;
        this.currentReading = currentReading;
        this.unitsConsumed = unitsConsumed;
        this.readingDate = readingDate;
        this.recordedBy = recordedBy;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Connection getConnection() {
        return connection;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }

    public Consumer getConsumer() {
        return consumer;
    }

    public void setConsumer(Consumer consumer) {
        this.consumer = consumer;
    }

    public String getBillingMonth() {
        return billingMonth;
    }

    public void setBillingMonth(String billingMonth) {
        this.billingMonth = billingMonth;
    }

    public BigDecimal getPreviousReading() {
        return previousReading;
    }

    public void setPreviousReading(BigDecimal previousReading) {
        this.previousReading = previousReading;
    }

    public BigDecimal getCurrentReading() {
        return currentReading;
    }

    public void setCurrentReading(BigDecimal currentReading) {
        this.currentReading = currentReading;
    }

    public BigDecimal getUnitsConsumed() {
        return unitsConsumed;
    }

    public void setUnitsConsumed(BigDecimal unitsConsumed) {
        this.unitsConsumed = unitsConsumed;
    }

    public LocalDate getReadingDate() {
        return readingDate;
    }

    public void setReadingDate(LocalDate readingDate) {
        this.readingDate = readingDate;
    }

    public String getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(String recordedBy) {
        this.recordedBy = recordedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
