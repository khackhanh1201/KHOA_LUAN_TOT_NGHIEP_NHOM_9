package com.thanglong.vneid.infrastructure.adapter.persistence;

import com.thanglong.vneid.domain.model.QrSession;
import com.thanglong.vneid.domain.repository.QrSessionRepository;
import com.thanglong.vneid.infrastructure.adapter.persistence.entity.QrSessionEntity;
import com.thanglong.vneid.infrastructure.adapter.persistence.jpa.QrSessionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adapter thực thi giao tiếp với DB cho QrSession.
 */
@Component
public class QrSessionPersistenceAdapter implements QrSessionRepository {

    private final QrSessionJpaRepository jpaRepository;

    public QrSessionPersistenceAdapter(QrSessionJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<QrSession> findByQrToken(String qrToken) {
        return jpaRepository.findByQrToken(qrToken).map(this::toDomain);
    }

    @Override
    public QrSession save(QrSession qrSession) {
        QrSessionEntity entity = toEntity(qrSession);
        QrSessionEntity savedEntity = jpaRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public void deleteByQrToken(String qrToken) {
        jpaRepository.deleteByQrToken(qrToken);
    }

    @Override
    public void deleteExpiredSessions() {
        jpaRepository.deleteExpiredSessions();
    }

    private QrSession toDomain(QrSessionEntity entity) {
        if (entity == null) return null;
        return QrSession.builder()
                .qrToken(entity.getQrToken())
                .status(entity.getStatus())
                .cccdNumber(entity.getCccdNumber())
                .createdAt(entity.getCreatedAt())
                .expiresAt(entity.getExpiresAt())
                .build();
    }

    private QrSessionEntity toEntity(QrSession domain) {
        if (domain == null) return null;
        return QrSessionEntity.builder()
                .qrToken(domain.getQrToken())
                .status(domain.getStatus())
                .cccdNumber(domain.getCccdNumber())
                .createdAt(domain.getCreatedAt())
                .expiresAt(domain.getExpiresAt())
                .build();
    }
}
