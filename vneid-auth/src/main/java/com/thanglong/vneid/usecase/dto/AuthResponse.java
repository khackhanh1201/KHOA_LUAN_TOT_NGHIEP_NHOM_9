package com.thanglong.vneid.usecase.dto;

import lombok.*;

/**
 * DTO cho phản hồi đăng nhập, bao gồm JWT token và thông tin cơ bản.
 */
public class AuthResponse {

    private String token;
    private String tokenType;
    private String userId;
    private String fullName;
    private String email;
    private String activeRole;
    private java.util.List<String> roles;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, String tokenType, String userId, String fullName, String email, String activeRole, java.util.List<String> roles, String message) {
        this.token = token;
        this.tokenType = tokenType;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.activeRole = activeRole;
        this.roles = roles;
        this.message = message;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getActiveRole() { return activeRole; }
    public void setActiveRole(String activeRole) { this.activeRole = activeRole; }
    public java.util.List<String> getRoles() { return roles; }
    public void setRoles(java.util.List<String> roles) { this.roles = roles; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public static class AuthResponseBuilder {
        private String token;
        private String tokenType;
        private String userId;
        private String fullName;
        private String email;
        private String activeRole;
        private java.util.List<String> roles;
        private String message;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public AuthResponseBuilder userId(String userId) { this.userId = userId; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder activeRole(String activeRole) { this.activeRole = activeRole; return this; }
        public AuthResponseBuilder roles(java.util.List<String> roles) { this.roles = roles; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }
        public AuthResponse build() {
            return new AuthResponse(token, tokenType, userId, fullName, email, activeRole, roles, message);
        }
    }
}
