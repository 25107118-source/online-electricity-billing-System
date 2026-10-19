package com.electricity.billing.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsDto {

    private long totalRegisteredConsumers;
    private long activeConnections;
    private long billsGeneratedThisMonth;
    private BigDecimal totalAmountBilledThisMonth;
    private BigDecimal totalAmountBilledAllTime;
    private BigDecimal totalAmountCollectedAllTime;
    private BigDecimal totalOutstandingPayments;
    private List<BillDto> recentBills;

    public DashboardStatsDto() {
    }

    public long getTotalRegisteredConsumers() {
        return totalRegisteredConsumers;
    }

    public void setTotalRegisteredConsumers(long totalRegisteredConsumers) {
        this.totalRegisteredConsumers = totalRegisteredConsumers;
    }

    public long getActiveConnections() {
        return activeConnections;
    }

    public void setActiveConnections(long activeConnections) {
        this.activeConnections = activeConnections;
    }

    public long getBillsGeneratedThisMonth() {
        return billsGeneratedThisMonth;
    }

    public void setBillsGeneratedThisMonth(long billsGeneratedThisMonth) {
        this.billsGeneratedThisMonth = billsGeneratedThisMonth;
    }

    public BigDecimal getTotalAmountBilledThisMonth() {
        return totalAmountBilledThisMonth;
    }

    public void setTotalAmountBilledThisMonth(BigDecimal totalAmountBilledThisMonth) {
        this.totalAmountBilledThisMonth = totalAmountBilledThisMonth;
    }

    public BigDecimal getTotalAmountBilledAllTime() {
        return totalAmountBilledAllTime;
    }

    public void setTotalAmountBilledAllTime(BigDecimal totalAmountBilledAllTime) {
        this.totalAmountBilledAllTime = totalAmountBilledAllTime;
    }

    public BigDecimal getTotalAmountCollectedAllTime() {
        return totalAmountCollectedAllTime;
    }

    public void setTotalAmountCollectedAllTime(BigDecimal totalAmountCollectedAllTime) {
        this.totalAmountCollectedAllTime = totalAmountCollectedAllTime;
    }

    public BigDecimal getTotalOutstandingPayments() {
        return totalOutstandingPayments;
    }

    public void setTotalOutstandingPayments(BigDecimal totalOutstandingPayments) {
        this.totalOutstandingPayments = totalOutstandingPayments;
    }

    public List<BillDto> getRecentBills() {
        return recentBills;
    }

    public void setRecentBills(List<BillDto> recentBills) {
        this.recentBills = recentBills;
    }
}
