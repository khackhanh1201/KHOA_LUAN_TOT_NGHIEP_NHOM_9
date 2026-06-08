package com.thanglong.landtax.infrastructure.adapter.persistence.jpa;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AreaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AreaJpaRepository extends JpaRepository<AreaEntity, Integer> {

    /** Tim tat ca khu vuc theo ma quan */
    List<AreaEntity> findByDistrictCode(String districtCode);

    Optional<AreaEntity> findByStreetNameAndPositionLevel(String streetName, Integer positionLevel);

    Optional<AreaEntity> findByWardCodeAndStreetNameAndPositionLevel(
            String wardCode, String streetName, Integer positionLevel);

    Optional<AreaEntity> findFirstByStreetName(String streetName);
}
