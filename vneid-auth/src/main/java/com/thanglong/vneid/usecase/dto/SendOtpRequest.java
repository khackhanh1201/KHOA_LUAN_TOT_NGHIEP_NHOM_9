package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO cho yêu cầu gửi OTP.
 */
public class SendOtpRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    public SendOtpRequest() {}
    public SendOtpRequest(String email) { this.email = email; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
} 
