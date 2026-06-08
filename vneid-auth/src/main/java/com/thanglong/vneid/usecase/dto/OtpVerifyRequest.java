package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OtpVerifyRequest {
    @NotBlank(message = "Số CCCD không được để trống")
    @Pattern(regexp = "\\d{12}", message = "Số CCCD phải có đúng 12 chữ số")
    private String cccdNumber;
    
    @NotBlank(message = "Mã OTP không được để trống")
    private String otpCode;

    public OtpVerifyRequest() {}

    public OtpVerifyRequest(String cccdNumber, String otpCode) {
        this.cccdNumber = cccdNumber;
        this.otpCode = otpCode;
    }

    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
}
