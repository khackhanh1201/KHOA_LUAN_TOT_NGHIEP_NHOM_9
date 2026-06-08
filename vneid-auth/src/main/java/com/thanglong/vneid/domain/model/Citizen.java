package com.thanglong.vneid.domain.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Domain model công dân theo ERD tài liệu (3.5.2.2).
 */
public class Citizen {
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

    public Citizen() {}

    public static CitizenBuilder builder() {
        return new CitizenBuilder();
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

    public static class CitizenBuilder {
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

        public CitizenBuilder cccdNumber(String v) { this.cccdNumber = v; return this; }
        public CitizenBuilder phoneNumber(String v) { this.phoneNumber = v; return this; }
        public CitizenBuilder passwordHash(String v) { this.passwordHash = v; return this; }
        public CitizenBuilder passcodeHash(String v) { this.passcodeHash = v; return this; }
        public CitizenBuilder fullName(String v) { this.fullName = v; return this; }
        public CitizenBuilder dob(LocalDate v) { this.dob = v; return this; }
        public CitizenBuilder gender(String v) { this.gender = v; return this; }
        public CitizenBuilder accountStatus(String v) { this.accountStatus = v; return this; }
        public CitizenBuilder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public CitizenBuilder email(String v) { this.email = v; return this; }
        public CitizenBuilder firebaseUid(String v) { this.firebaseUid = v; return this; }
        public CitizenBuilder firebaseEmail(String v) { this.firebaseEmail = v; return this; }

        public Citizen build() {
            Citizen c = new Citizen();
            c.cccdNumber = cccdNumber;
            c.phoneNumber = phoneNumber;
            c.passwordHash = passwordHash;
            c.passcodeHash = passcodeHash;
            c.fullName = fullName;
            c.dob = dob;
            c.gender = gender;
            c.accountStatus = accountStatus;
            c.createdAt = createdAt;
            c.email = email;
            c.firebaseUid = firebaseUid;
            c.firebaseEmail = firebaseEmail;
            return c;
        }
    }
}
