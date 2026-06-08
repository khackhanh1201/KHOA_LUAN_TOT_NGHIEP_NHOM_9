package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO cho yêu cầu xác nhận QR từ thiết bị mobile.
 */
public class QrConfirmRequest {

    @com.fasterxml.jackson.annotation.JsonProperty("qr_token")
    @NotBlank(message = "Mã QR không được để trống")
    private String qrToken;

    @com.fasterxml.jackson.annotation.JsonProperty("firebase_uid")
    private String firebaseUid;

    @com.fasterxml.jackson.annotation.JsonProperty("cccd_number")
    private String cccdNumber;

    @com.fasterxml.jackson.annotation.JsonProperty("mobile_token")
    private String mobileToken;

    public QrConfirmRequest() {}

    public QrConfirmRequest(String qrToken, String firebaseUid, String cccdNumber, String mobileToken) {
        this.qrToken = qrToken;
        this.firebaseUid = firebaseUid;
        this.cccdNumber = cccdNumber;
        this.mobileToken = mobileToken;
    }
    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    public String getFirebaseUid() { return firebaseUid; }
    public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getMobileToken() { return mobileToken; }
    public void setMobileToken(String mobileToken) { this.mobileToken = mobileToken; }
}
