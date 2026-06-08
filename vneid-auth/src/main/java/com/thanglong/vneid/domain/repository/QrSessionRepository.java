package com.thanglong.vneid.domain.repository;

import com.thanglong.vneid.domain.model.QrSession;

import java.util.Optional;

/**
 * Cổng giao tiếp dữ liệu cho QR Session.
 */
public interface QrSessionRepository {
    Optional<QrSession> findByQrToken(String qrToken);

    QrSession save(QrSession qrSession);

    void deleteByQrToken(String qrToken);

    void deleteExpiredSessions();
}
