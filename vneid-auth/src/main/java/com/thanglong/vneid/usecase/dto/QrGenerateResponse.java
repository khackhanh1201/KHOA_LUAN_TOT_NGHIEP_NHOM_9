package com.thanglong.vneid.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO trả về khi khởi tạo mã QR.
 */
public class QrGenerateResponse {
    private String qrToken;
    private String qrBase64Image;
    private java.time.LocalDateTime expiresAt;
    private String message;

    public QrGenerateResponse() {}
    public QrGenerateResponse(String qrToken, String qrBase64Image, java.time.LocalDateTime expiresAt, String message) {
        this.qrToken = qrToken;
        this.qrBase64Image = qrBase64Image;
        this.expiresAt = expiresAt;
        this.message = message;
    }

    public static QrGenerateResponseBuilder builder() {
        return new QrGenerateResponseBuilder();
    }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    public String getQrBase64Image() { return qrBase64Image; }
    public void setQrBase64Image(String qrBase64Image) { this.qrBase64Image = qrBase64Image; }
    public java.time.LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(java.time.LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public static class QrGenerateResponseBuilder {
        private String qrToken;
        private String qrBase64Image;
        private java.time.LocalDateTime expiresAt;
        private String message;

        public QrGenerateResponseBuilder qrToken(String qrToken) { this.qrToken = qrToken; return this; }
        public QrGenerateResponseBuilder qrBase64Image(String qrBase64Image) { this.qrBase64Image = qrBase64Image; return this; }
        public QrGenerateResponseBuilder expiresAt(java.time.LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public QrGenerateResponseBuilder message(String message) { this.message = message; return this; }
        public QrGenerateResponse build() {
            return new QrGenerateResponse(qrToken, qrBase64Image, expiresAt, message);
        }
    }
}
