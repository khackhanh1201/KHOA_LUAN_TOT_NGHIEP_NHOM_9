package com.thanglong.vneid.usecase.port;

/**
 * Interface cổng giao tiếp cho dịch vụ gửi Email.
 * Triển khai cụ thể nằm ở infrastructure layer.
 */
public interface EmailService {

    void sendOtpEmail(String to, String otpCode);

    void sendActivationEmail(String to, String activationLink);

    void sendPasswordResetEmail(String to, String resetLink);
}
