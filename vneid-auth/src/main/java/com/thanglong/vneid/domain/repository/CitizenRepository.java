package com.thanglong.vneid.domain.repository;

import com.thanglong.vneid.domain.model.Citizen;

import java.util.List;
import java.util.Optional;

/**
 * Cổng giao tiếp dữ liệu cho Citizen.
 * Interface này thuộc domain layer, không phụ thuộc framework.
 */
public interface CitizenRepository {

    Optional<Citizen> findById(String cccdNumber);

    Optional<Citizen> findByCccdNumber(String cccdNumber);

    Optional<Citizen> findByFirebaseUid(String firebaseUid);

    Optional<Citizen> findByEmail(String email);

    Optional<Citizen> findByPhoneNumber(String phoneNumber);

    List<Citizen> findAll();

    Citizen save(Citizen citizen);

    void deleteById(String cccdNumber);

    boolean existsByEmail(String email);

    boolean existsByCccdNumber(String cccdNumber);
}
