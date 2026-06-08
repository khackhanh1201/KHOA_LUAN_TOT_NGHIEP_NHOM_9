package com.thanglong.vneid.infrastructure.adapter.persistence.jpa;

import com.thanglong.vneid.infrastructure.adapter.persistence.entity.QrSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrSessionJpaRepository extends JpaRepository<QrSessionEntity, String> {

    Optional<QrSessionEntity> findByQrToken(String qrToken);

    void deleteByQrToken(String qrToken);

    @Modifying
    @Query("DELETE FROM QrSessionEntity q WHERE q.expiresAt < CURRENT_TIMESTAMP")
    void deleteExpiredSessions();
}
