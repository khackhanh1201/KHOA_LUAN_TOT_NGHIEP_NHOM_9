package com.thanglong.vneid.infrastructure.adapter.external;

import com.thanglong.vneid.usecase.port.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Triển khai gửi email HTML qua Spring Mail.
 */
@Service
public class EmailServiceAdapter implements EmailService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(EmailServiceAdapter.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailServiceAdapter(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendOtpEmail(String to, String otpCode) {
        String subject = "[VNeID] Mã xác thực OTP";
        String html = EmailTemplateBuilder.buildOtpEmail(otpCode);
        String plain = "Mã OTP của bạn là: " + otpCode + "\nMã có hiệu lực trong 5 phút.";
        sendHtmlEmail(to, subject, html, plain);
    }

    @Override
    public void sendActivationEmail(String to, String activationLink) {
        String subject = "[VNeID] Kích hoạt tài khoản";
        String html = EmailTemplateBuilder.buildActivationEmail(activationLink);
        String plain = "Nhấn vào link sau để kích hoạt tài khoản: " + activationLink;
        sendHtmlEmail(to, subject, html, plain);
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "[VNeID] Đặt lại mật khẩu";
        String html = EmailTemplateBuilder.buildPasswordResetEmail(resetLink);
        String plain = "Nhấn vào link sau để đặt lại mật khẩu: " + resetLink;
        sendHtmlEmail(to, subject, html, plain);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody, String plainFallback) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(fromAddress, "VNeID - Địa chính số");
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plainFallback, htmlBody);
            mailSender.send(message);
            log.info("Email sent to {} — subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {} ({}): {}", to, subject, e.getMessage());
        }
    }
}
