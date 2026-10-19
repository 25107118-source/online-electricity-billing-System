package com.electricity.billing.service;

import com.electricity.billing.dto.BillDto;
import com.electricity.billing.dto.DashboardStatsDto;
import com.electricity.billing.entity.ConnectionStatus;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.ConnectionRepository;
import com.electricity.billing.repository.ConsumerRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ConsumerRepository consumerRepository;
    private final ConnectionRepository connectionRepository;
    private final BillRepository billRepository;
    private final BillingService billingService;

    public DashboardService(ConsumerRepository consumerRepository,
                            ConnectionRepository connectionRepository,
                            BillRepository billRepository,
                            BillingService billingService) {
        this.consumerRepository = consumerRepository;
        this.connectionRepository = connectionRepository;
        this.billRepository = billRepository;
        this.billingService = billingService;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        stats.setTotalRegisteredConsumers(consumerRepository.count());
        stats.setActiveConnections(connectionRepository.countByStatus(ConnectionStatus.ACTIVE));
        stats.setBillsGeneratedThisMonth(billRepository.countByBillingMonth(currentMonth));
        stats.setTotalAmountBilledThisMonth(billRepository.sumTotalAmountByBillingMonth(currentMonth));

        BigDecimal totalBilled = billRepository.sumTotalAmountAll();
        BigDecimal totalCollected = billRepository.sumTotalCollectedAll();
        BigDecimal totalOutstanding = billRepository.sumTotalOutstandingAll();

        stats.setTotalAmountBilledAllTime(totalBilled != null ? totalBilled : BigDecimal.ZERO);
        stats.setTotalAmountCollectedAllTime(totalCollected != null ? totalCollected : BigDecimal.ZERO);
        stats.setTotalOutstandingPayments(totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO);

        List<BillDto> recentBills = billRepository.findAllByOrderByBillDateDesc().stream()
                .limit(5)
                .map(billingService::mapToDto)
                .collect(Collectors.toList());
        stats.setRecentBills(recentBills);

        return stats;
    }
}
