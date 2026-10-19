package com.electricity.billing.repository;

import com.electricity.billing.entity.Bill;
import com.electricity.billing.entity.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillNumber(String billNumber);
    boolean existsByConnectionIdAndBillingMonth(Long connectionId, String billingMonth);

    List<Bill> findByConsumerConsumerNumberOrderByBillDateDesc(String consumerNumber);
    List<Bill> findByConnectionIdOrderByBillDateDesc(Long connectionId);
    List<Bill> findAllByOrderByBillDateDesc();

    List<Bill> findByBillingMonth(String billingMonth);
    List<Bill> findByStatus(BillStatus status);

    @Query("SELECT b FROM Bill b WHERE " +
           "(:consumerNumber IS NULL OR b.consumer.consumerNumber = :consumerNumber) AND " +
           "(:billingMonth IS NULL OR b.billingMonth = :billingMonth) AND " +
           "(:status IS NULL OR b.status = :status) " +
           "ORDER BY b.billDate DESC")
    List<Bill> searchBills(@Param("consumerNumber") String consumerNumber,
                           @Param("billingMonth") String billingMonth,
                           @Param("status") BillStatus status);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.billingMonth = :month")
    long countByBillingMonth(@Param("month") String month);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.billingMonth = :month")
    BigDecimal sumTotalAmountByBillingMonth(@Param("month") String month);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b")
    BigDecimal sumTotalAmountAll();

    @Query("SELECT COALESCE(SUM(b.paidAmount), 0) FROM Bill b")
    BigDecimal sumTotalCollectedAll();

    @Query("SELECT COALESCE(SUM(b.balanceAmount), 0) FROM Bill b")
    BigDecimal sumTotalOutstandingAll();
}
