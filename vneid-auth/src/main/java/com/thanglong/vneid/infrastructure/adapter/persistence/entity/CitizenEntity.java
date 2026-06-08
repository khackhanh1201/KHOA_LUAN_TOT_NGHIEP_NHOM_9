package com.thanglong.vneid.infrastructure.adapter.persistence.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA Entity mapping bảng {@code citizens} theo ERD tài liệu (3.5.2.2).
 */
@Entity
@Table(name = "citizens")
public class CitizenEntity {

    @Id
    @Column(name = "cccd_number", nullable = false, length = 12)
    private String cccdNumber;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "passcode_hash", nullable = false)
    private String passcodeHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "account_status", length = 20)
    private String accountStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "email")
    private String email;

    @Column(name = "firebase_uid", length = 255)
    private String firebaseUid;

    @Column(name = "firebase_email")
    private String firebaseEmail;

    public CitizenEntity() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public static CitizenEntityBuilder builder() {
        return new CitizenEntityBuilder();
    }

    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getPasscodeHash() { return passcodeHash; }
    public void setPasscodeHash(String passcodeHash) { this.passcodeHash = passcodeHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirebaseUid() { return firebaseUid; }
    public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
    public String getFirebaseEmail() { return firebaseEmail; }
    public void setFirebaseEmail(String firebaseEmail) { this.firebaseEmail = firebaseEmail; }

    public static class CitizenEntityBuilder {
        private String cccdNumber;
        private String phoneNumber;
        private String passwordHash;
        private String passcodeHash;
        private String fullName;
        private LocalDate dob;
        private String gender;
        private String accountStatus;
        private LocalDateTime createdAt;
        private String email;
        private String firebaseUid;
        private String firebaseEmail;

        public CitizenEntityBuilder cccdNumber(String v) { this.cccdNumber = v; return this; }
        public CitizenEntityBuilder phoneNumber(String v) { this.phoneNumber = v; return this; }
        public CitizenEntityBuilder passwordHash(String v) { this.passwordHash = v; return this; }
        public CitizenEntityBuilder passcodeHash(String v) { this.passcodeHash = v; return this; }
        public CitizenEntityBuilder fullName(String v) { this.fullName = v; return this; }
        public CitizenEntityBuilder dob(LocalDate v) { this.dob = v; return this; }
        public CitizenEntityBuilder gender(String v) { this.gender = v; return this; }
        public CitizenEntityBuilder accountStatus(String v) { this.accountStatus = v; return this; }
        public CitizenEntityBuilder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public CitizenEntityBuilder email(String v) { this.email = v; return this; }
        public CitizenEntityBuilder firebaseUid(String v) { this.firebaseUid = v; return this; }
        public CitizenEntityBuilder firebaseEmail(String v) { this.firebaseEmail = v; return this; }

        public CitizenEntity build() {
            CitizenEntity e = new CitizenEntity();
            e.cccdNumber = cccdNumber;
            e.phoneNumber = phoneNumber;
            e.passwordHash = passwordHash;
            e.passcodeHash = passcodeHash;
            e.fullName = fullName;
            e.dob = dob;
            e.gender = gender;
            e.accountStatus = accountStatus;
            e.createdAt = createdAt;
            e.email = email;
            e.firebaseUid = firebaseUid;
            e.firebaseEmail = firebaseEmail;
            return e;
        }
    }
}
