package com.thanglong.landtax.infrastructure.adapter.persistence.jpa;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ComplaintEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data JPA repository cho ComplaintEntity.
 */
@Repository
public interface ComplaintJpaRepository extends JpaRepository<ComplaintEntity, Integer> {
    long countByStatus(String status);

    @Query(
        "SELECT COUNT(c) FROM ComplaintEntity c LEFT JOIN c.record r WHERE c.status = :status AND " +
        "((:type = 'TAX' AND r.recordCategory IN ('TAX_DECLARATION', 'TAX')) OR " +
        "(:type = 'LAND' AND (r IS NULL OR r.recordCategory NOT IN ('TAX_DECLARATION', 'TAX'))))"
    )
    long countByStatusAndComplaintType(@Param("status") String status, @Param("type") String type);

    List<ComplaintEntity> findByCitizenCitizenId(Integer citizenId);

    @Query(
        "SELECT c FROM ComplaintEntity c LEFT JOIN c.record r WHERE " +
        "(:type IS NULL) OR " +
        "(:type = 'TAX' AND r.recordCategory IN ('TAX_DECLARATION', 'TAX')) OR " +
        "(:type = 'LAND' AND (r IS NULL OR r.recordCategory NOT IN ('TAX_DECLARATION', 'TAX')))"
    )
    List<ComplaintEntity> findByComplaintType(@Param("type") String type);

    @Query("""
        SELECT COUNT(c) FROM ComplaintEntity c
        LEFT JOIN c.record r
        LEFT JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        LEFT JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR c.createdAt >= :from)
          AND (:to IS NULL OR c.createdAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
        """)
    long countComplaintsForCadastralReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode);

    @Query("""
        SELECT COUNT(c) FROM ComplaintEntity c
        LEFT JOIN c.record r
        LEFT JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        LEFT JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR c.createdAt >= :from)
          AND (:to IS NULL OR c.createdAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND c.status = 'RESOLVED'
        """)
    long countResolvedComplaintsForCadastralReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode);

    @Query("""
        SELECT COUNT(c) FROM ComplaintEntity c
        LEFT JOIN c.record r
        LEFT JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        LEFT JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR c.createdAt >= :from)
          AND (:to IS NULL OR c.createdAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND c.status = 'PENDING'
        """)
    long countPendingComplaintsForCadastralReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode);

    @Query("""
        SELECT COALESCE(a.wardCode, 'UNKNOWN'), COUNT(c),
               SUM(CASE WHEN c.status = 'RESOLVED' THEN 1 ELSE 0 END),
               SUM(CASE WHEN c.status = 'PENDING' THEN 1 ELSE 0 END)
        FROM ComplaintEntity c
        LEFT JOIN c.record r
        LEFT JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        LEFT JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR c.createdAt >= :from)
          AND (:to IS NULL OR c.createdAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
        GROUP BY COALESCE(a.wardCode, 'UNKNOWN')
        ORDER BY COALESCE(a.wardCode, 'UNKNOWN')
        """)
    List<Object[]> countComplaintStatsByWard(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode);

    @Query("""
        SELECT c, COALESCE(a.wardCode, 'UNKNOWN') FROM ComplaintEntity c
        LEFT JOIN c.record r
        LEFT JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        LEFT JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR c.createdAt >= :from)
          AND (:to IS NULL OR c.createdAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
        ORDER BY c.createdAt DESC
        """)
    List<Object[]> findComplaintsForCadastralDetails(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode);

    @Query("""
        SELECT MONTH(c.createdAt), COUNT(c),
               SUM(CASE WHEN c.status = 'RESOLVED' THEN 1 ELSE 0 END)
        FROM ComplaintEntity c
        LEFT JOIN c.record r
        LEFT JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        LEFT JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE YEAR(c.createdAt) = :year
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
        GROUP BY MONTH(c.createdAt)
        ORDER BY MONTH(c.createdAt)
        """)
    List<Object[]> countComplaintMonthlyTrend(
            @Param("year") int year,
            @Param("wardCode") String wardCode);

    @Query("""
        SELECT MONTH(c.createdAt), COUNT(c),
               SUM(CASE WHEN c.status = 'RESOLVED' THEN 1 ELSE 0 END)
        FROM ComplaintEntity c
        LEFT JOIN c.record r
        LEFT JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        LEFT JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR c.createdAt >= :from)
          AND (:to IS NULL OR c.createdAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
        GROUP BY MONTH(c.createdAt)
        ORDER BY MONTH(c.createdAt)
        """)
    List<Object[]> countComplaintMonthlyTrendInRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode);
}
