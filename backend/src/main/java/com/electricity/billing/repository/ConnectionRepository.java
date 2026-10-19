package com.electricity.billing.repository;

import com.electricity.billing.entity.Connection;
import com.electricity.billing.entity.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findByConnectionNumber(String connectionNumber);
    Optional<Connection> findByMeterNumber(String meterNumber);
    boolean existsByConnectionNumber(String connectionNumber);
    boolean existsByMeterNumber(String meterNumber);
    List<Connection> findByConsumerId(Long consumerId);
    List<Connection> findByConsumerConsumerNumber(String consumerNumber);
    long countByStatus(ConnectionStatus status);
}
