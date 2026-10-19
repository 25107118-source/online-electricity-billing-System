package com.electricity.billing.repository;

import com.electricity.billing.entity.ConnectionType;
import com.electricity.billing.entity.TariffSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TariffSlabRepository extends JpaRepository<TariffSlab, Long> {
    List<TariffSlab> findByConnectionTypeAndActiveTrueOrderByFromUnitAsc(ConnectionType connectionType);
    List<TariffSlab> findAllByOrderByConnectionTypeAscFromUnitAsc();
}
