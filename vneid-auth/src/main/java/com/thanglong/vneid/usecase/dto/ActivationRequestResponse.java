package com.thanglong.vneid.usecase.dto;

public class ActivationRequestResponse {
    private String maskedEmail;
    private String message;

    public ActivationRequestResponse() {}
    public ActivationRequestResponse(String maskedEmail, String message) {
        this.maskedEmail = maskedEmail;
        this.message = message;
    }

    public String getMaskedEmail() { return maskedEmail; }
    public void setMaskedEmail(String maskedEmail) { this.maskedEmail = maskedEmail; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
