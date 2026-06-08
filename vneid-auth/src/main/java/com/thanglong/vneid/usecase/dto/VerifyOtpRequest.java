package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO cho yêu cầu xác thực OTP.
 */
public class VerifyOtpRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mã OTP không được để trống")
    private String otpCode;

    public VerifyOtpRequest() {}
    public VerifyOtpRequest(String email, String otpCode) {
        this.email = email;
        this.otpCode = otpCode;
    }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
}
