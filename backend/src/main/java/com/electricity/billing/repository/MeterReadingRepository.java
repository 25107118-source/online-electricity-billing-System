package com.electricity.billing.repository;

import com.electricity.billing.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    Optional<MeterReading> findByConnectionIdAndBillingMonth(Long connectionId, String billingMonth);
    boolean existsByConnectionIdAndBillingMonth(Long connectionId, String billingMonth);

    // Retrieve latest reading prior to or on given date for a connection
    @Query("SELECT r FROM MeterReading r WHERE r.connection.id = :connectionId ORDER BY r.readingDate DESC, r.id DESC LIMIT 1")
    Optional<MeterReading> findLatestByConnectionId(@Param("connectionId") Long connectionId);

    List<MeterReading> findByConnectionIdOrderByReadingDateDesc(Long connectionId);
    List<MeterReading> findByConsumerConsumerNumberOrderByReadingDateDesc(String consumerNumber);
    List<MeterReading> findAllByOrderByReadingDateDesc();
}
