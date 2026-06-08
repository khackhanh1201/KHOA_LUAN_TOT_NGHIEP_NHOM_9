package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class LoginRequest {
    @NotBlank(message = "Số CCCD không được để trống")
    @Pattern(regexp = "\\d{12}", message = "Số CCCD phải có đúng 12 chữ số")
    private String cccdNumber;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    public LoginRequest() {}

    public LoginRequest(String cccdNumber, String password) {
        this.cccdNumber = cccdNumber;
        this.password = password;
    }

    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
