package com.thanglong.vneid.infrastructure.adapter.persistence.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * JPA Entity mapping bảng {@code otp_requests} theo ERD tài liệu (3.5.2.2).
 */
@Entity
@Table(name = "otp_requests")
public class OtpEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cccd_number", nullable = false, length = 12)
    private String cccdNumber;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_used")
    private boolean used;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public OtpEntity() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public static OtpEntityBuilder builder() {
        return new OtpEntityBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class OtpEntityBuilder {
        private Long id;
        private String cccdNumber;
        private String otpCode;
        private String email;
        private LocalDateTime expiresAt;
        private boolean used;
        private LocalDateTime createdAt;

        public OtpEntityBuilder id(Long id) { this.id = id; return this; }
        public OtpEntityBuilder cccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; return this; }
        public OtpEntityBuilder otpCode(String otpCode) { this.otpCode = otpCode; return this; }
        public OtpEntityBuilder email(String email) { this.email = email; return this; }
        public OtpEntityBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public OtpEntityBuilder used(boolean used) { this.used = used; return this; }
        public OtpEntityBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public OtpEntity build() {
            OtpEntity e = new OtpEntity();
            e.id = id;
            e.cccdNumber = cccdNumber;
            e.otpCode = otpCode;
            e.email = email;
            e.expiresAt = expiresAt;
            e.used = used;
            e.createdAt = createdAt;
            return e;
        }
    }
}
