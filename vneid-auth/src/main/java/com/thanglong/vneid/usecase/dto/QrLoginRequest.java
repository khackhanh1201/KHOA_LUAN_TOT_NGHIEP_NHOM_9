package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.NotBlank;

public class QrLoginRequest {
    @NotBlank(message = "QR Token không được để trống")
    private String qrToken;

    public QrLoginRequest() {}
    public QrLoginRequest(String qrToken) { this.qrToken = qrToken; }
    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
}
