package com.thanglong.vneid.infrastructure.adapter.persistence;

import com.thanglong.vneid.domain.model.Citizen;
import com.thanglong.vneid.domain.repository.CitizenRepository;
import com.thanglong.vneid.infrastructure.adapter.persistence.entity.CitizenEntity;
import com.thanglong.vneid.infrastructure.adapter.persistence.jpa.CitizenJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class CitizenPersistenceAdapter implements CitizenRepository {

    private final CitizenJpaRepository jpaRepository;

    public CitizenPersistenceAdapter(CitizenJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<Citizen> findById(String cccdNumber) {
        return jpaRepository.findById(cccdNumber).map(this::toDomain);
    }

    @Override
    public Optional<Citizen> findByCccdNumber(String cccdNumber) {
        return jpaRepository.findByCccdNumber(cccdNumber).map(this::toDomain);
    }

    @Override
    public Optional<Citizen> findByFirebaseUid(String firebaseUid) {
        return jpaRepository.findByFirebaseUid(firebaseUid).map(this::toDomain);
    }

    @Override
    public Optional<Citizen> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<Citizen> findByPhoneNumber(String phoneNumber) {
        return jpaRepository.findByPhoneNumber(phoneNumber).map(this::toDomain);
    }

    @Override
    public List<Citizen> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Citizen save(Citizen citizen) {
        return toDomain(jpaRepository.save(toEntity(citizen)));
    }

    @Override
    public void deleteById(String cccdNumber) {
        jpaRepository.deleteById(cccdNumber);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByCccdNumber(String cccdNumber) {
        return jpaRepository.existsByCccdNumber(cccdNumber);
    }

    private Citizen toDomain(CitizenEntity entity) {
        return Citizen.builder()
                .cccdNumber(entity.getCccdNumber())
                .phoneNumber(entity.getPhoneNumber())
                .passwordHash(entity.getPasswordHash())
                .passcodeHash(entity.getPasscodeHash())
                .fullName(entity.getFullName())
                .dob(entity.getDob())
                .gender(entity.getGender())
                .accountStatus(entity.getAccountStatus())
                .createdAt(entity.getCreatedAt())
                .email(entity.getEmail())
                .firebaseUid(entity.getFirebaseUid())
                .firebaseEmail(entity.getFirebaseEmail())
                .build();
    }

    private CitizenEntity toEntity(Citizen citizen) {
        return CitizenEntity.builder()
                .cccdNumber(citizen.getCccdNumber())
                .phoneNumber(citizen.getPhoneNumber())
                .passwordHash(citizen.getPasswordHash())
                .passcodeHash(citizen.getPasscodeHash())
                .fullName(citizen.getFullName())
                .dob(citizen.getDob())
                .gender(citizen.getGender())
                .accountStatus(citizen.getAccountStatus())
                .createdAt(citizen.getCreatedAt())
                .email(citizen.getEmail())
                .firebaseUid(citizen.getFirebaseUid())
                .firebaseEmail(citizen.getFirebaseEmail())
                .build();
    }
}
