package com.thanglong.vneid.usecase.dto;

public class ActivationSetPasswordResponse {
    private String fullName;
    private String cccdNumber;
    private String message;

    public ActivationSetPasswordResponse() {}
    public ActivationSetPasswordResponse(String fullName, String cccdNumber, String message) {
        this.fullName = fullName;
        this.cccdNumber = cccdNumber;
        this.message = message;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getCccdNumber() { return cccdNumber; }
    public void setCccdNumber(String cccdNumber) { this.cccdNumber = cccdNumber; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
