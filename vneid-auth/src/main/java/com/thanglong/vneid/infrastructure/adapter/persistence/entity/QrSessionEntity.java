package com.thanglong.vneid.infrastructure.adapter.persistence.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * JPA Entity mapping bảng {@code qr_login_sessions} theo ERD tài liệu (3.5.2.2).
 */
@Entity
@Table(name = "qr_login_sessions")
public class QrSessionEntity {

    @Id
    @Column(name = "qr_token", nullable = false)
    private String qrToken;

    @Column(name = "cccd_number", length = 12)
    private String cccdNumber;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public QrSessionEntity() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public static QrSessionEntityBuilder builder() {
        return new QrSessionEntityBuilder();
    }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class QrSessionEntityBuilder {
        private String qrToken;
        private String cccdNumber;
        private String status;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;

        public QrSessionEntityBuilder qrToken(String qrToken) { this.qrToken = qrToken; return this; }
        public QrSessionEntityBuilder cccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; return this; }
        public QrSessionEntityBuilder status(String status) { this.status = status; return this; }
        public QrSessionEntityBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public QrSessionEntityBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public QrSessionEntity build() {
            QrSessionEntity e = new QrSessionEntity();
            e.qrToken = qrToken;
            e.cccdNumber = cccdNumber;
            e.status = status;
            e.expiresAt = expiresAt;
            e.createdAt = createdAt;
            return e;
        }
    }
}
