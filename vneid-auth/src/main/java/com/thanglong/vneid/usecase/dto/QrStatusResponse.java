package com.thanglong.vneid.usecase.dto;

public class QrStatusResponse {
    private String status;
    private String token; // Có thể để trống nếu chưa SUCCESS

    public QrStatusResponse() {}
    public QrStatusResponse(String status, String token) {
        this.status = status;
        this.token = token;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
