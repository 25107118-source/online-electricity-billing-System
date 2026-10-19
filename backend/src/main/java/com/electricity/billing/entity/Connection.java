package com.electricity.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "connections")
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "connection_number", nullable = false, unique = true, length = 50)
    private String connectionNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Consumer consumer;

    @Enumerated(EnumType.STRING)
    @Column(name = "connection_type", nullable = false, length = 20)
    private ConnectionType connectionType;

    @Column(name = "meter_number", nullable = false, unique = true, length = 50)
    private String meterNumber;

    @Column(name = "sanctioned_load_kw", precision = 5, scale = 2)
    private BigDecimal sanctionedLoadKw = new BigDecimal("1.00");

    @Column(name = "connection_date", nullable = false)
    private LocalDate connectionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConnectionStatus status = ConnectionStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Connection() {
    }

    public Connection(String connectionNumber, Consumer consumer, ConnectionType connectionType,
                      String meterNumber, BigDecimal sanctionedLoadKw, LocalDate connectionDate, ConnectionStatus status) {
        this.connectionNumber = connectionNumber;
        this.consumer = consumer;
        this.connectionType = connectionType;
        this.meterNumber = meterNumber;
        this.sanctionedLoadKw = sanctionedLoadKw;
        this.connectionDate = connectionDate;
        this.status = status != null ? status : ConnectionStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConnectionNumber() {
        return connectionNumber;
    }

    public void setConnectionNumber(String connectionNumber) {
        this.connectionNumber = connectionNumber;
    }

    public Consumer getConsumer() {
        return consumer;
    }

    public void setConsumer(Consumer consumer) {
        this.consumer = consumer;
    }

    public ConnectionType getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(ConnectionType connectionType) {
        this.connectionType = connectionType;
    }

    public String getMeterNumber() {
        return meterNumber;
    }

    public void setMeterNumber(String meterNumber) {
        this.meterNumber = meterNumber;
    }

    public BigDecimal getSanctionedLoadKw() {
        return sanctionedLoadKw;
    }

    public void setSanctionedLoadKw(BigDecimal sanctionedLoadKw) {
        this.sanctionedLoadKw = sanctionedLoadKw;
    }

    public LocalDate getConnectionDate() {
        return connectionDate;
    }

    public void setConnectionDate(LocalDate connectionDate) {
        this.connectionDate = connectionDate;
    }

    public ConnectionStatus getStatus() {
        return status;
    }

    public void setStatus(ConnectionStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
