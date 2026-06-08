package com.thanglong.landtax.infrastructure.adapter.persistence.jpa;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface RecordJpaRepository extends JpaRepository<RecordEntity, Integer> {

    List<RecordEntity> findByCitizenId(Integer citizenId);

    List<RecordEntity> findByLandParcelId(Integer landParcelId);

    List<RecordEntity> findByCurrentStatus(String currentStatus);

    long countByCurrentStatusIn(Collection<String> statuses);

    List<RecordEntity> findByCurrentStatusInOrderBySubmittedAtDesc(Collection<String> statuses);

    List<RecordEntity> findByRecordCategory(String recordCategory);

    List<RecordEntity> findByCitizenIdAndRecordCategory(Integer citizenId, String recordCategory);

    List<RecordEntity> findByLandParcelIdAndRecordCategory(Integer landParcelId, String recordCategory);

    @Query("""
    SELECT r FROM RecordEntity r
    WHERE r.currentStatus IN :statuses
    ORDER BY r.submittedAt DESC
    """)
    List<RecordEntity> findTaxRecordsByStatuses(@Param("statuses") List<String> statuses);
    @Query("""
        SELECT r.currentStatus, COUNT(r)
        FROM RecordEntity r
        GROUP BY r.currentStatus
        """)
    List<Object[]> countRecordsByStatus();

    @Query("""
        SELECT COUNT(r) FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR r.submittedAt >= :from)
          AND (:to IS NULL OR r.submittedAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
        """)
    long countRecordsForCadastralReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);

    @Query("""
        SELECT COUNT(r) FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR r.submittedAt >= :from)
          AND (:to IS NULL OR r.submittedAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
          AND r.currentStatus IN ('APPROVED', 'VERIFIED', 'COMPLETED')
        """)
    long countResolvedRecordsForCadastralReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);

    @Query("""
        SELECT COUNT(r) FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR r.submittedAt >= :from)
          AND (:to IS NULL OR r.submittedAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
          AND r.currentStatus IN ('SUBMITTED', 'PENDING', 'PROCESSING', 'NEED_MORE_DOCS')
        """)
    long countProcessingRecordsForCadastralReport(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);

    @Query("""
        SELECT COUNT(r) FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
          AND r.currentStatus IN ('SUBMITTED', 'PENDING', 'PROCESSING', 'NEED_MORE_DOCS')
          AND r.submittedAt < :deadline
        """)
    long countOverdueRecordsForCadastralReport(
            @Param("deadline") LocalDateTime deadline,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);

    @Query("""
        SELECT a.wardCode, COUNT(r),
               SUM(CASE WHEN r.currentStatus IN ('APPROVED', 'VERIFIED', 'COMPLETED') THEN 1 ELSE 0 END),
               SUM(CASE WHEN r.currentStatus IN ('SUBMITTED', 'PENDING', 'PROCESSING', 'NEED_MORE_DOCS') THEN 1 ELSE 0 END)
        FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR r.submittedAt >= :from)
          AND (:to IS NULL OR r.submittedAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
        GROUP BY a.wardCode
        ORDER BY a.wardCode
        """)
    List<Object[]> countRecordStatsByWard(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);

    @Query("""
        SELECT r, a.wardCode FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR r.submittedAt >= :from)
          AND (:to IS NULL OR r.submittedAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
        ORDER BY r.submittedAt DESC
        """)
    List<Object[]> findRecordsForCadastralDetails(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);

    @Query("""
        SELECT MONTH(r.submittedAt), COUNT(r),
               SUM(CASE WHEN r.currentStatus IN ('APPROVED', 'VERIFIED', 'COMPLETED') THEN 1 ELSE 0 END)
        FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE YEAR(r.submittedAt) = :year
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
        GROUP BY MONTH(r.submittedAt)
        ORDER BY MONTH(r.submittedAt)
        """)
    List<Object[]> countRecordMonthlyTrend(
            @Param("year") int year,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);

    @Query("""
        SELECT MONTH(r.submittedAt), COUNT(r),
               SUM(CASE WHEN r.currentStatus IN ('APPROVED', 'VERIFIED', 'COMPLETED') THEN 1 ELSE 0 END)
        FROM RecordEntity r
        JOIN LandParcelEntity p ON r.landParcelId = p.landParcelId
        JOIN AreaEntity a ON p.areaId = a.areaId
        WHERE (:from IS NULL OR r.submittedAt >= :from)
          AND (:to IS NULL OR r.submittedAt < :to)
          AND (:wardCode IS NULL OR a.wardCode = :wardCode)
          AND (:excludeTax = false OR r.recordCategory NOT IN ('TAX', 'TAX_DECLARATION'))
        GROUP BY MONTH(r.submittedAt)
        ORDER BY MONTH(r.submittedAt)
        """)
    List<Object[]> countRecordMonthlyTrendInRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("wardCode") String wardCode,
            @Param("excludeTax") boolean excludeTax);
}

