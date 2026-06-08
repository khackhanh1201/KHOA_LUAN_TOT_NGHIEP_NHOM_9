package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ActivationRequest {
    @NotBlank(message = "Số CCCD không được để trống")
    @Pattern(regexp = "\\d{12}", message = "Số CCCD phải có đúng 12 chữ số")
    private String cccdNumber;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    
    @NotBlank(message = "Email không được để trống")
    private String email;

    public ActivationRequest() {}

    public ActivationRequest(String cccdNumber, String phoneNumber, String email) {
        this.cccdNumber = cccdNumber;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }

    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
