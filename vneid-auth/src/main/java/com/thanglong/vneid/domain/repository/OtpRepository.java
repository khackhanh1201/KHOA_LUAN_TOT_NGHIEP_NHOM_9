package com.thanglong.vneid.domain.repository;

import com.thanglong.vneid.domain.model.Otp;

import java.util.Optional;

/**
 * Cổng giao tiếp dữ liệu cho OTP.
 */
public interface OtpRepository {

    Optional<Otp> findByEmailAndOtpCode(String email, String otpCode);

    Optional<Otp> findByCccdNumberAndOtpCode(String cccdNumber, String otpCode);

    Optional<Otp> findLatestByEmail(String email);

    Otp save(Otp otp);

    void deleteByEmail(String email);

    void deleteByCccdNumber(String cccdNumber);
}
