package com.thanglong.vneid.infrastructure.adapter.persistence.jpa;

import com.thanglong.vneid.infrastructure.adapter.persistence.entity.OtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpJpaRepository extends JpaRepository<OtpEntity, Long> {

    Optional<OtpEntity> findByEmailAndOtpCode(String email, String otpCode);

    Optional<OtpEntity> findByCccdNumberAndOtpCode(String cccdNumber, String otpCode);

    @Query("SELECT o FROM OtpEntity o WHERE o.email = :email ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpEntity> findLatestByEmail(String email);

    void deleteByEmail(String email);

    void deleteByCccdNumber(String cccdNumber);
}
