package com.thanglong.vneid.usecase.service;

import com.thanglong.vneid.domain.model.Otp;
import com.thanglong.vneid.domain.repository.OtpRepository;
import com.thanglong.vneid.usecase.port.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * Use case xác thực OTP.
 */
@Service
public class VerifyOtpUseCase {

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    public VerifyOtpUseCase(OtpRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;

    /**
     * Tạo và gửi OTP đến email.
     */
    public void generateAndSendOtp(String email) {
        String otpCode = generateOtpCode();

        Otp otp = Otp.builder()
                .email(email)
                .otpCode(otpCode)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();

        otpRepository.save(otp);
        emailService.sendOtpEmail(email, otpCode);
    }

    /**
     * Xác thực OTP.
     */
    public boolean verifyOtp(String email, String otpCode) {
        Otp otp = otpRepository.findByEmailAndOtpCode(email, otpCode)
                .orElseThrow(() -> new RuntimeException("OTP không hợp lệ"));

        if (otp.isUsed()) {
            throw new RuntimeException("OTP đã được sử dụng");
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP đã hết hạn");
        }

        otp.setUsed(true);
        otpRepository.save(otp);
        return true;
    }

    private String generateOtpCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
