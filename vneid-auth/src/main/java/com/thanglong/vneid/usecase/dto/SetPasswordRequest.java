package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SetPasswordRequest {
    @NotBlank(message = "Số CCCD không được để trống")
    @Pattern(regexp = "\\d{12}", message = "Số CCCD phải có đúng 12 chữ số")
    private String cccdNumber;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;

    public SetPasswordRequest() {}

    public SetPasswordRequest(String cccdNumber, String password) {
        this.cccdNumber = cccdNumber;
        this.password = password;
    }

    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
