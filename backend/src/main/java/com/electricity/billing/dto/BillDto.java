package com.electricity.billing.dto;

import com.electricity.billing.entity.BillStatus;
import com.electricity.billing.entity.ConnectionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BillDto {

    private Long id;
    private String billNumber;

    // Connection & Consumer info
    private Long connectionId;
    private String connectionNumber;
    private ConnectionType connectionType;
    private String meterNumber;
    private BigDecimal sanctionedLoadKw;

    private Long consumerId;
    private String consumerNumber;
    private String consumerName;
    private String consumerEmail;
    private String consumerPhone;
    private String consumerAddress;

    // Meter readings info
    private Long meterReadingId;
    private String billingMonth;
    private BigDecimal previousReading;
    private BigDecimal currentReading;
    private BigDecimal unitsConsumed;
    private LocalDate readingDate;

    // Billing amounts
    private LocalDate billDate;
    private LocalDate dueDate;
    private BigDecimal energyCharges;
    private BigDecimal fixedCharges;
    private BigDecimal otherCharges;
    private BigDecimal lateFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private BillStatus status;
    private String tariffDetailsJson;
    private LocalDateTime createdAt;

    public BillDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }

    public String getConnectionNumber() {
        return connectionNumber;
    }

    public void setConnectionNumber(String connectionNumber) {
        this.connectionNumber = connectionNumber;
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

    public Long getConsumerId() {
        return consumerId;
    }

    public void setConsumerId(Long consumerId) {
        this.consumerId = consumerId;
    }

    public String getConsumerNumber() {
        return consumerNumber;
    }

    public void setConsumerNumber(String consumerNumber) {
        this.consumerNumber = consumerNumber;
    }

    public String getConsumerName() {
        return consumerName;
    }

    public void setConsumerName(String consumerName) {
        this.consumerName = consumerName;
    }

    public String getConsumerEmail() {
        return consumerEmail;
    }

    public void setConsumerEmail(String consumerEmail) {
        this.consumerEmail = consumerEmail;
    }

    public String getConsumerPhone() {
        return consumerPhone;
    }

    public void setConsumerPhone(String consumerPhone) {
        this.consumerPhone = consumerPhone;
    }

    public String getConsumerAddress() {
        return consumerAddress;
    }

    public void setConsumerAddress(String consumerAddress) {
        this.consumerAddress = consumerAddress;
    }

    public Long getMeterReadingId() {
        return meterReadingId;
    }

    public void setMeterReadingId(Long meterReadingId) {
        this.meterReadingId = meterReadingId;
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

    public LocalDate getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getEnergyCharges() {
        return energyCharges;
    }

    public void setEnergyCharges(BigDecimal energyCharges) {
        this.energyCharges = energyCharges;
    }

    public BigDecimal getFixedCharges() {
        return fixedCharges;
    }

    public void setFixedCharges(BigDecimal fixedCharges) {
        this.fixedCharges = fixedCharges;
    }

    public BigDecimal getOtherCharges() {
        return otherCharges;
    }

    public void setOtherCharges(BigDecimal otherCharges) {
        this.otherCharges = otherCharges;
    }

    public BigDecimal getLateFee() {
        return lateFee;
    }

    public void setLateFee(BigDecimal lateFee) {
        this.lateFee = lateFee;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getBalanceAmount() {
        return balanceAmount;
    }

    public void setBalanceAmount(BigDecimal balanceAmount) {
        this.balanceAmount = balanceAmount;
    }

    public BillStatus getStatus() {
        return status;
    }

    public void setStatus(BillStatus status) {
        this.status = status;
    }

    public String getTariffDetailsJson() {
        return tariffDetailsJson;
    }

    public void setTariffDetailsJson(String tariffDetailsJson) {
        this.tariffDetailsJson = tariffDetailsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
