package com.thanglong.vneid.domain.model;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Domain model đại diện cho mã OTP xác thực.
 */
public class Otp {

    private Long id;
    private String cccdNumber; // CCCD liên kết với OTP
    private String email;
    private String otpCode;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean used;

    public Otp() {
    }

    public Otp(Long id, String cccdNumber, String email, String otpCode, LocalDateTime createdAt,
            LocalDateTime expiresAt, boolean used) {
        this.id = id;
        this.cccdNumber = cccdNumber;
        this.email = email;
        this.otpCode = otpCode;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.used = used;
    }

    public static OtpBuilder builder() {
        return new OtpBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCccdNumber() {
        return cccdNumber;
    }

    public void setCccdNumber(String cccdNumber) {
        this.cccdNumber = cccdNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
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

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public static class OtpBuilder {
        private Long id;
        private String cccdNumber;
        private String email;
        private String otpCode;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
        private boolean used;

        public OtpBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public OtpBuilder cccdNumber(String cccdNumber) {
            this.cccdNumber = cccdNumber;
            return this;
        }

        public OtpBuilder email(String email) {
            this.email = email;
            return this;
        }

        public OtpBuilder otpCode(String otpCode) {
            this.otpCode = otpCode;
            return this;
        }

        public OtpBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public OtpBuilder expiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public OtpBuilder used(boolean used) {
            this.used = used;
            return this;
        }

        public Otp build() {
            return new Otp(id, cccdNumber, email, otpCode, createdAt, expiresAt, used);
        }
    }
}
