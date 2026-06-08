package com.thanglong.vneid.infrastructure.adapter.persistence.jpa;

import com.thanglong.vneid.infrastructure.adapter.persistence.entity.CitizenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CitizenJpaRepository extends JpaRepository<CitizenEntity, String> {

    Optional<CitizenEntity> findByCccdNumber(String cccdNumber);

    Optional<CitizenEntity> findByFirebaseUid(String firebaseUid);

    Optional<CitizenEntity> findByEmail(String email);

    Optional<CitizenEntity> findByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);

    boolean existsByCccdNumber(String cccdNumber);
}
