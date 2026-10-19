package com.electricity.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"connection_id", "billing_month"})
})
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true, length = 50)
    private String billNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "connection_id", nullable = false)
    private Connection connection;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "consumer_id", nullable = false)
    private Consumer consumer;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "meter_reading_id", nullable = false)
    private MeterReading meterReading;

    @Column(name = "billing_month", nullable = false, length = 7)
    private String billingMonth; // Format: YYYY-MM

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "units_consumed", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitsConsumed;

    @Column(name = "energy_charges", nullable = false, precision = 10, scale = 2)
    private BigDecimal energyCharges;

    @Column(name = "fixed_charges", nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedCharges;

    @Column(name = "other_charges", precision = 10, scale = 2)
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(name = "late_fee", precision = 10, scale = 2)
    private BigDecimal lateFee = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "balance_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal balanceAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BillStatus status = BillStatus.UNPAID;

    @Column(name = "tariff_details_json", columnDefinition = "TEXT")
    private String tariffDetailsJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Bill() {
    }

    public Bill(String billNumber, Connection connection, Consumer consumer, MeterReading meterReading,
                String billingMonth, LocalDate billDate, LocalDate dueDate, BigDecimal unitsConsumed,
                BigDecimal energyCharges, BigDecimal fixedCharges, BigDecimal otherCharges, BigDecimal lateFee,
                BigDecimal discount, BigDecimal totalAmount, BigDecimal balanceAmount, BillStatus status,
                String tariffDetailsJson) {
        this.billNumber = billNumber;
        this.connection = connection;
        this.consumer = consumer;
        this.meterReading = meterReading;
        this.billingMonth = billingMonth;
        this.billDate = billDate;
        this.dueDate = dueDate;
        this.unitsConsumed = unitsConsumed;
        this.energyCharges = energyCharges;
        this.fixedCharges = fixedCharges;
        this.otherCharges = otherCharges != null ? otherCharges : BigDecimal.ZERO;
        this.lateFee = lateFee != null ? lateFee : BigDecimal.ZERO;
        this.discount = discount != null ? discount : BigDecimal.ZERO;
        this.totalAmount = totalAmount;
        this.paidAmount = BigDecimal.ZERO;
        this.balanceAmount = balanceAmount;
        this.status = status != null ? status : BillStatus.UNPAID;
        this.tariffDetailsJson = tariffDetailsJson;
        this.createdAt = LocalDateTime.now();
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

    public MeterReading getMeterReading() {
        return meterReading;
    }

    public void setMeterReading(MeterReading meterReading) {
        this.meterReading = meterReading;
    }

    public String getBillingMonth() {
        return billingMonth;
    }

    public void setBillingMonth(String billingMonth) {
        this.billingMonth = billingMonth;
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

    public BigDecimal getUnitsConsumed() {
        return unitsConsumed;
    }

    public void setUnitsConsumed(BigDecimal unitsConsumed) {
        this.unitsConsumed = unitsConsumed;
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
