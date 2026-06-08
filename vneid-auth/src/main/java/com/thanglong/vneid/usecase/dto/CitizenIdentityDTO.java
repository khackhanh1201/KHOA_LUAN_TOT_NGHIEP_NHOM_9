package com.thanglong.vneid.usecase.dto;

import java.time.LocalDate;

/**
 * DTO thông tin định danh công dân — Internal API GET /api/vneid/internal/citizens/{cccd}.
 * Khớp các trường bảng {@code citizens} trong ERD tài liệu.
 */
public class CitizenIdentityDTO {
    private String cccdNumber;
    private String fullName;
    private LocalDate dob;
    private String gender;
    private String email;
    private String phoneNumber;
    private String firebaseUid;
    private String firebaseEmail;

    public CitizenIdentityDTO() {}

    public static CitizenIdentityDTOBuilder builder() {
        return new CitizenIdentityDTOBuilder();
    }

    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getFirebaseUid() { return firebaseUid; }
    public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
    public String getFirebaseEmail() { return firebaseEmail; }
    public void setFirebaseEmail(String firebaseEmail) { this.firebaseEmail = firebaseEmail; }

    public static class CitizenIdentityDTOBuilder {
        private String cccdNumber;
        private String fullName;
        private LocalDate dob;
        private String gender;
        private String email;
        private String phoneNumber;
        private String firebaseUid;
        private String firebaseEmail;

        public CitizenIdentityDTOBuilder cccdNumber(String v) { this.cccdNumber = v; return this; }
        public CitizenIdentityDTOBuilder fullName(String v) { this.fullName = v; return this; }
        public CitizenIdentityDTOBuilder dob(LocalDate v) { this.dob = v; return this; }
        public CitizenIdentityDTOBuilder gender(String v) { this.gender = v; return this; }
        public CitizenIdentityDTOBuilder email(String v) { this.email = v; return this; }
        public CitizenIdentityDTOBuilder phoneNumber(String v) { this.phoneNumber = v; return this; }
        public CitizenIdentityDTOBuilder firebaseUid(String v) { this.firebaseUid = v; return this; }
        public CitizenIdentityDTOBuilder firebaseEmail(String v) { this.firebaseEmail = v; return this; }

        public CitizenIdentityDTO build() {
            CitizenIdentityDTO dto = new CitizenIdentityDTO();
            dto.cccdNumber = cccdNumber;
            dto.fullName = fullName;
            dto.dob = dob;
            dto.gender = gender;
            dto.email = email;
            dto.phoneNumber = phoneNumber;
            dto.firebaseUid = firebaseUid;
            dto.firebaseEmail = firebaseEmail;
            return dto;
        }
    }
}
