package com.thanglong.landtax.infrastructure.adapter.persistence.jpa;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxPaymentJpaRepository extends JpaRepository<TaxPaymentEntity, Integer> {

    List<TaxPaymentEntity> findByLandParcelId(Integer landParcelId);

    List<TaxPaymentEntity> findByRecordId(Integer recordId);

    List<TaxPaymentEntity> findByPaymentStatus(String paymentStatus);

    Optional<TaxPaymentEntity> findByTransactionCode(String transactionCode);

    List<TaxPaymentEntity> findByLandParcelIdAndTaxYear(Integer landParcelId, Integer taxYear);

    List<TaxPaymentEntity> findByRecordIdAndTaxYear(Integer recordId, Integer taxYear);

    @Query("SELECT p FROM TaxPaymentEntity p JOIN RecordEntity r ON p.recordId = r.recordId " +
           "WHERE p.landParcelId = :landParcelId AND p.taxYear = :taxYear " +
           "AND r.recordCategory <> :excludeCategory")
    List<TaxPaymentEntity> findByLandParcelIdAndTaxYearExcludingRecordCategory(
            @Param("landParcelId") Integer landParcelId,
            @Param("taxYear") Integer taxYear,
            @Param("excludeCategory") String excludeCategory);

    @Query("SELECT SUM(p.totalAmountDue) FROM TaxPaymentEntity p WHERE p.paymentStatus = 'PAID' AND p.taxYear = :year")
    java.math.BigDecimal sumPaidAmountByYear(int year);

    @Query("SELECT MONTH(p.paidAt) as month, SUM(p.totalAmountDue) as totalRevenue " +
           "FROM TaxPaymentEntity p " +
           "WHERE YEAR(p.paidAt) = :year AND p.paymentStatus = 'PAID' " +
           "GROUP BY MONTH(p.paidAt)")
    List<Object[]> getMonthlyRevenue(@Param("year") int year);

    // ================= NEW FIX: Lọc hóa đơn theo CCCD =================
    @Query(value = "SELECT p.* FROM tax_payments p " +
                   "JOIN records r ON p.record_id = r.record_id " +
                   "JOIN citizen_local c ON r.citizen_id = c.citizen_id " +
                   "WHERE c.cccd_number = :cccd AND p.payment_status IN :statuses", 
           nativeQuery = true)
           List<TaxPaymentEntity> findUnpaidByCitizenCccdAndStatuses(
              @Param("cccd") String cccd,
              @Param("statuses") List<String> statuses
          );

    @Query(value = "SELECT p.* FROM tax_payments p " +
                   "JOIN records r ON p.record_id = r.record_id " +
                   "JOIN citizen_local c ON r.citizen_id = c.citizen_id " +
                   "WHERE c.cccd_number = :cccd AND p.payment_status = 'PAID' " +
                   "ORDER BY p.paid_at DESC",
           nativeQuery = true)
    List<TaxPaymentEntity> findPaidByCitizenCccd(@Param("cccd") String cccd);

    @Query("SELECT p FROM TaxPaymentEntity p WHERE p.paymentStatus IN :statuses " +
           "AND p.transactionCode IS NOT NULL AND p.transactionCode <> ''")
    List<TaxPaymentEntity> findPendingWithTransactionCode(@Param("statuses") List<String> statuses);

    @Query("SELECT p FROM TaxPaymentEntity p JOIN RecordEntity r ON p.recordId = r.recordId " +
           "WHERE r.citizenId = :citizenId AND p.taxYear = :taxYear " +
           "AND p.paymentStatus IN ('UNPAID', 'AWAITING_PAYMENT')")
    List<TaxPaymentEntity> findAdjustableByCitizenIdAndTaxYear(
            @Param("citizenId") Integer citizenId,
            @Param("taxYear") Integer taxYear);
}