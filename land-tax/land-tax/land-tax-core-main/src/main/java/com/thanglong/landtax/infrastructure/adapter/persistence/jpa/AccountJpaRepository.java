package com.thanglong.landtax.infrastructure.adapter.persistence.jpa;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountJpaRepository extends JpaRepository<AccountEntity, Integer> {
        long countByAccountStatus(String accountStatus);
    /**
     * @deprecated Một citizen có thể có nhiều account (multi-role). Dùng
     *             {@link #findFirstByCitizenIdAndRoleCodeOrderByAccountIdDesc} hoặc {@link com.thanglong.landtax.domain.service.AccountLookupService}.
     */
    @Deprecated
    Optional<AccountEntity> findByCitizenId(Integer citizenId);

    /** Khi trùng citizen_id, lấy account_id lớn nhất (mới nhất). */
    Optional<AccountEntity> findFirstByCitizenIdOrderByAccountIdDesc(Integer citizenId);

    java.util.List<AccountEntity> findAllByCitizenId(Integer citizenId);

    @org.springframework.data.jpa.repository.Query(
            value = "SELECT a FROM AccountEntity a "
                    + "JOIN RoleEntity r ON a.roleId = r.roleId "
                    + "WHERE a.citizenId = :citizenId AND r.roleCode = :roleCode "
                    + "ORDER BY a.accountId DESC "
                    + "LIMIT 1")
    Optional<AccountEntity> findFirstByCitizenIdAndRoleCodeOrderByAccountIdDesc(
            @org.springframework.data.repository.query.Param("citizenId") Integer citizenId,
            @org.springframework.data.repository.query.Param("roleCode") String roleCode);

    boolean existsByCitizenId(Integer citizenId);

    @org.springframework.data.jpa.repository.Query("SELECT r.roleCode " +
            "FROM AccountEntity a " +
            "JOIN CitizenLocalEntity c ON a.citizenId = c.citizenId " +
            "JOIN RoleEntity r ON a.roleId = r.roleId " +
            "WHERE c.cccdNumber = :cccdNumber")
    java.util.List<String> findRoleCodesByCccdNumber(@org.springframework.data.repository.query.Param("cccdNumber") String cccdNumber);

    @org.springframework.data.jpa.repository.Query("SELECT new com.thanglong.landtax.usecase.dto.UserAdminDTO(" +
            "a.accountId, c.cccdNumber, c.fullName, r.roleCode, a.accountStatus, c.phoneNumber, c.email) " +
            "FROM AccountEntity a " +
            "JOIN CitizenLocalEntity c ON a.citizenId = c.citizenId " +
            "JOIN RoleEntity r ON a.roleId = r.roleId " +
            "WHERE (:search IS NULL OR :search = '' OR " +
            "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "c.cccdNumber LIKE CONCAT('%', :search, '%') OR " +
            "LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "c.phoneNumber LIKE CONCAT('%', :search, '%'))")
    java.util.List<com.thanglong.landtax.usecase.dto.UserAdminDTO> findAllWithCitizenInfo(@org.springframework.data.repository.query.Param("search") String search);
}
