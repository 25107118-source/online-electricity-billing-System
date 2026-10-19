package com.electricity.billing.dto;

import java.math.BigDecimal;

public class MonthlyReportDto {

    private String month;
    private long totalBills;
    private BigDecimal totalUnitsConsumed;
    private BigDecimal totalBilledAmount;
    private BigDecimal totalCollectedAmount;
    private BigDecimal outstandingAmount;
    private double collectionEfficiencyPercentage;

    public MonthlyReportDto() {
    }

    public MonthlyReportDto(String month, long totalBills, BigDecimal totalUnitsConsumed,
                            BigDecimal totalBilledAmount, BigDecimal totalCollectedAmount,
                            BigDecimal outstandingAmount, double collectionEfficiencyPercentage) {
        this.month = month;
        this.totalBills = totalBills;
        this.totalUnitsConsumed = totalUnitsConsumed;
        this.totalBilledAmount = totalBilledAmount;
        this.totalCollectedAmount = totalCollectedAmount;
        this.outstandingAmount = outstandingAmount;
        this.collectionEfficiencyPercentage = collectionEfficiencyPercentage;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public long getTotalBills() {
        return totalBills;
    }

    public void setTotalBills(long totalBills) {
        this.totalBills = totalBills;
    }

    public BigDecimal getTotalUnitsConsumed() {
        return totalUnitsConsumed;
    }

    public void setTotalUnitsConsumed(BigDecimal totalUnitsConsumed) {
        this.totalUnitsConsumed = totalUnitsConsumed;
    }

    public BigDecimal getTotalBilledAmount() {
        return totalBilledAmount;
    }

    public void setTotalBilledAmount(BigDecimal totalBilledAmount) {
        this.totalBilledAmount = totalBilledAmount;
    }

    public BigDecimal getTotalCollectedAmount() {
        return totalCollectedAmount;
    }

    public void setTotalCollectedAmount(BigDecimal totalCollectedAmount) {
        this.totalCollectedAmount = totalCollectedAmount;
    }

    public BigDecimal getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(BigDecimal outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }

    public double getCollectionEfficiencyPercentage() {
        return collectionEfficiencyPercentage;
    }

    public void setCollectionEfficiencyPercentage(double collectionEfficiencyPercentage) {
        this.collectionEfficiencyPercentage = collectionEfficiencyPercentage;
    }
}
