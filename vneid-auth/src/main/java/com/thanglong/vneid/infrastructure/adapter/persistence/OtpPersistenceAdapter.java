package com.thanglong.vneid.infrastructure.adapter.persistence;

import com.thanglong.vneid.domain.model.Otp;
import com.thanglong.vneid.domain.repository.OtpRepository;
import com.thanglong.vneid.infrastructure.adapter.persistence.entity.OtpEntity;
import com.thanglong.vneid.infrastructure.adapter.persistence.jpa.OtpJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class OtpPersistenceAdapter implements OtpRepository {

    private final OtpJpaRepository otpJpaRepository;

    public OtpPersistenceAdapter(OtpJpaRepository otpJpaRepository) {
        this.otpJpaRepository = otpJpaRepository;
    }

    @Override
    public Optional<Otp> findByEmailAndOtpCode(String email, String otpCode) {
        return otpJpaRepository.findByEmailAndOtpCode(email, otpCode)
                .map(this::toDomainModel);
    }

    @Override
    public Optional<Otp> findByCccdNumberAndOtpCode(String cccdNumber, String otpCode) {
        return otpJpaRepository.findByCccdNumberAndOtpCode(cccdNumber, otpCode)
                .map(this::toDomainModel);
    }

    @Override
    public Optional<Otp> findLatestByEmail(String email) {
        return otpJpaRepository.findLatestByEmail(email)
                .map(this::toDomainModel);
    }

    @Override
    public Otp save(Otp otp) {
        OtpEntity entity = toEntity(otp);
        OtpEntity savedEntity = otpJpaRepository.save(entity);
        return toDomainModel(savedEntity);
    }

    @Override
    public void deleteByEmail(String email) {
        otpJpaRepository.deleteByEmail(email);
    }

    @Override
    public void deleteByCccdNumber(String cccdNumber) {
        otpJpaRepository.deleteByCccdNumber(cccdNumber);
    }

    private Otp toDomainModel(OtpEntity entity) {
        if (entity == null) return null;
        return Otp.builder()
                .id(entity.getId())
                .cccdNumber(entity.getCccdNumber())
                .email(entity.getEmail())
                .otpCode(entity.getOtpCode())
                .createdAt(entity.getCreatedAt())
                .expiresAt(entity.getExpiresAt())
                .used(entity.isUsed())
                .build();
    }

    private OtpEntity toEntity(Otp otp) {
        if (otp == null) return null;
        return OtpEntity.builder()
                .id(otp.getId())
                .cccdNumber(otp.getCccdNumber())
                .email(otp.getEmail())
                .otpCode(otp.getOtpCode())
                .createdAt(otp.getCreatedAt())
                .expiresAt(otp.getExpiresAt())
                .used(otp.isUsed())
                .build();
    }
}
