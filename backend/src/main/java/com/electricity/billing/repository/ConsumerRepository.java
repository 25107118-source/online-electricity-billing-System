package com.electricity.billing.repository;

import com.electricity.billing.entity.Consumer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsumerRepository extends JpaRepository<Consumer, Long> {
    Optional<Consumer> findByConsumerNumber(String consumerNumber);
    boolean existsByConsumerNumber(String consumerNumber);
    boolean existsByEmail(String email);

    @Query("SELECT c FROM Consumer c WHERE " +
           "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.consumerNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Consumer> searchConsumers(@Param("keyword") String keyword);
}
