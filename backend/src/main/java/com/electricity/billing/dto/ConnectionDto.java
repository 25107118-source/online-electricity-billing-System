package com.electricity.billing.dto;

import com.electricity.billing.entity.ConnectionStatus;
import com.electricity.billing.entity.ConnectionType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ConnectionDto {

    private Long id;
    private String connectionNumber;

    @NotNull(message = "Consumer ID is required")
    private Long consumerId;
    private String consumerName;
    private String consumerNumber;

    @NotNull(message = "Connection type is required")
    private ConnectionType connectionType;

    private String meterNumber;
    private BigDecimal sanctionedLoadKw;
    private LocalDate connectionDate;
    private ConnectionStatus status;
    private LocalDateTime createdAt;

    public ConnectionDto() {
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

    public Long getConsumerId() {
        return consumerId;
    }

    public void setConsumerId(Long consumerId) {
        this.consumerId = consumerId;
    }

    public String getConsumerName() {
        return consumerName;
    }

    public void setConsumerName(String consumerName) {
        this.consumerName = consumerName;
    }

    public String getConsumerNumber() {
        return consumerNumber;
    }

    public void setConsumerNumber(String consumerNumber) {
        this.consumerNumber = consumerNumber;
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
