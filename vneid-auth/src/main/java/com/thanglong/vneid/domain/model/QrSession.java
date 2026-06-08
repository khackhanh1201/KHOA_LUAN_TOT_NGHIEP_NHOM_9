package com.thanglong.vneid.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Domain model đại diện cho phiên đăng nhập bằng QR Code.
 */
public class QrSession {
    private String qrToken;
    private String status; // PENDING, SUCCESS, EXPIRED
    private String cccdNumber;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public QrSession() {
    }

    public QrSession(String qrToken, String status, String cccdNumber, LocalDateTime createdAt,
            LocalDateTime expiresAt) {
        this.qrToken = qrToken;
        this.status = status;
        this.cccdNumber = cccdNumber;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public static QrSessionBuilder builder() {
        return new QrSessionBuilder();
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCccdNumber() {
        return cccdNumber;
    }

    public void setCccdNumber(String cccdNumber) {
        this.cccdNumber = cccdNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public static class QrSessionBuilder {
        private String qrToken;
        private String status;
        private String cccdNumber;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;

        public QrSessionBuilder qrToken(String qrToken) {
            this.qrToken = qrToken;
            return this;
        }

        public QrSessionBuilder status(String status) {
            this.status = status;
            return this;
        }

        public QrSessionBuilder cccdNumber(String cccdNumber) {
            this.cccdNumber = cccdNumber;
            return this;
        }

        public QrSessionBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public QrSessionBuilder expiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public QrSession build() {
            return new QrSession(qrToken, status, cccdNumber, createdAt, expiresAt);
        }
    }
}
