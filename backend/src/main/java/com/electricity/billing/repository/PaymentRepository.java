package com.electricity.billing.repository;

import com.electricity.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByReceiptNumber(String receiptNumber);
    List<Payment> findByBillIdOrderByPaymentDateDesc(Long billId);
    List<Payment> findByConsumerConsumerNumberOrderByPaymentDateDesc(String consumerNumber);
    List<Payment> findAllByOrderByPaymentDateDesc();

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p")
    BigDecimal sumTotalPayments();
}
