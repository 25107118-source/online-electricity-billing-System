package com.electricity.billing.service;

import com.electricity.billing.dto.MonthlyReportDto;
import com.electricity.billing.entity.Bill;
import com.electricity.billing.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BillRepository billRepository;

    public ReportService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public List<MonthlyReportDto> getMonthlyReports() {
        List<Bill> allBills = billRepository.findAll();

        Map<String, List<Bill>> billsByMonth = allBills.stream()
                .collect(Collectors.groupingBy(Bill::getBillingMonth, TreeMap::new, Collectors.toList()));

        List<MonthlyReportDto> reports = new ArrayList<>();

        for (Map.Entry<String, List<Bill>> entry : billsByMonth.entrySet()) {
            String month = entry.getKey();
            List<Bill> bills = entry.getValue();

            long totalBills = bills.size();
            BigDecimal units = bills.stream()
                    .map(Bill::getUnitsConsumed)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal billed = bills.stream()
                    .map(Bill::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal collected = bills.stream()
                    .map(Bill::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal outstanding = bills.stream()
                    .map(Bill::getBalanceAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double efficiency = 0.0;
            if (billed.compareTo(BigDecimal.ZERO) > 0) {
                efficiency = collected.divide(billed, 4, RoundingMode.HALF_UP).doubleValue() * 100;
            }

            reports.add(new MonthlyReportDto(month, totalBills, units, billed, collected, outstanding, Math.round(efficiency * 10.0) / 10.0));
        }

        Collections.reverse(reports);
        return reports;
    }
}
