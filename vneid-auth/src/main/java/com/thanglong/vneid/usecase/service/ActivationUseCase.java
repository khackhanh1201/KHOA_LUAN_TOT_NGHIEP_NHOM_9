package com.thanglong.vneid.usecase.service;

import com.thanglong.vneid.domain.model.Citizen;
import com.thanglong.vneid.domain.model.Otp;
import com.thanglong.vneid.domain.repository.CitizenRepository;
import com.thanglong.vneid.domain.repository.OtpRepository;
import com.thanglong.vneid.usecase.port.EmailService;
import org.springframework.stereotype.Service;

@Service
public class ActivationUseCase {

    private final CitizenRepository citizenRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;

    public ActivationUseCase(CitizenRepository citizenRepository, OtpRepository otpRepository, EmailService emailService) {
        this.citizenRepository = citizenRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    /**
     * Bước 1: Yêu cầu kích hoạt.
     * Kiểm tra CCCD và SĐT, gửi OTP về Email.
     */
    public String requestActivation(String cccdNumber, String phoneNumber, String email) {
        Citizen citizen = citizenRepository.findByCccdNumber(cccdNumber)
                .orElseThrow(() -> new RuntimeException("Số CCCD không tồn tại trong hệ thống"));

        if (!citizen.getPhoneNumber().equals(phoneNumber)) {
            throw new RuntimeException("Số điện thoại không khớp với dữ liệu dân cư");
        }

        if (!citizen.getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Email không khớp với dữ liệu dân cư");
        }

        if ("ACTIVE".equals(citizen.getAccountStatus())) {
            throw new RuntimeException("Tài khoản đã được kích hoạt");
        }

        // Sinh OTP
        String otpCode = String.format("%06d", new java.util.Random().nextInt(1000000));
        
        Otp otp = Otp.builder()
                .cccdNumber(cccdNumber)
                .email(email)
                .otpCode(otpCode)
                .createdAt(java.time.LocalDateTime.now())
                .expiresAt(java.time.LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        otpRepository.save(otp);
        emailService.sendOtpEmail(email, otpCode);

        // Masked email: t***@gmail.com
        return maskEmail(email);
    }

    /**
     * Bước 2: Xác thực OTP.
     */
    public void verifyOtp(String cccdNumber, String otpCode) {
        Otp otp = otpRepository.findByCccdNumberAndOtpCode(cccdNumber, otpCode)
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ"));

        if (otp.isUsed()) {
            throw new RuntimeException("Mã OTP đã được sử dụng");
        }

        if (otp.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        otp.setUsed(true);
        otpRepository.save(otp);
    }

    /**
     * Bước 3: Đặt mật khẩu đăng nhập và kích hoạt tài khoản (không yêu cầu mã PIN).
     */
    public Citizen setPassword(String cccdNumber, String password) {
        Citizen citizen = citizenRepository.findByCccdNumber(cccdNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin công dân"));

        if ("ACTIVE".equals(citizen.getAccountStatus())) {
            throw new RuntimeException("Tài khoản đã được kích hoạt");
        }

        citizen.setPasswordHash(password);
        if (citizen.getPasscodeHash() == null || citizen.getPasscodeHash().isBlank()) {
            citizen.setPasscodeHash(password);
        }
        citizen.setAccountStatus("ACTIVE");

        return citizenRepository.save(citizen);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf("@");
        if (atIndex <= 1) return email;
        String prefix = email.substring(0, 1);
        String domain = email.substring(atIndex);
        return prefix + "***" + domain;
    }
}
