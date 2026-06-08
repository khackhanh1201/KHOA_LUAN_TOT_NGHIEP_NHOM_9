package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.domain.service.TaxPayableAmountService;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxDeclarationRepository;
import com.thanglong.landtax.usecase.dto.TaxDeclarationRequest;
import com.thanglong.landtax.usecase.dto.TaxDeclarationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.thanglong.landtax.domain.service.NotificationService;
import java.math.BigDecimal;
import java.time.LocalDate;


/**
 * Use case xu ly nop to khai thue dat.
 *
 * <p>
 * <b>Luong xu ly:</b>
 * </p>
 * <ol>
 * <li>Lay cccd_number tu JWT (SecurityContext) -> goi
 * SyncUserFromVneidUseCase -> citizen_id</li>
 * <li>Tim thua dat (land_parcels) theo parcel_id</li>
 * <li>Phat hien gian lan: so sanh declared_area vs area_size (nguong
 * 2%)</li>
 * <li>Tinh thue: Dien tich x Don gia dat</li>
 * <li>Luu to khai vao bang records (category=TAX_DECLARATION,
 * status=PENDING/WARNING_FRAUD)</li>
 * <li>Tao ban ghi tax_payments voi so tien thue tinh duoc</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class SubmitDeclarationUseCase {

    private final SyncUserFromVneidUseCase syncUserFromVneidUseCase;
    private final TaxPaymentAmountService taxPaymentAmountService;
    private final TaxPayableAmountService taxPayableAmountService;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final AuditLogService auditLogService;
    private final PaymentService paymentService;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandOwnerJpaRepository landOwnerJpaRepository;
    private final LandParcelService landParcelService;
    private final TaxDeclarationService taxDeclarationService;
    private final NotificationService notificationService;
    /** Mac dinh record_category neu nguoi dung khong truyen. */
    private static final String DEFAULT_RECORD_CATEGORY = "TAX_DECLARATION";
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordDocumentJpaRepository recordDocumentJpaRepository;
    /**
     * Nop to khai thue dat.
     *
     * @param request DTO chua: parcelId, attachmentIds
     * @return TaxDeclarationResponse voi ket qua xu ly
     */
    @Transactional
    public TaxDeclarationResponse submitDeclaration(TaxDeclarationRequest request) {

        // ===== BUOC 1: Lay citizen_id tu JWT =====
        String cccdNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Integer citizenId = syncUserFromVneidUseCase.syncAndGetCitizenId(cccdNumber);
        int currentYear = LocalDate.now().getYear();

        boolean isNewLandOwnership = RecordCategories.isLandOwnershipNew(request.getRecordCategory());
        log.info("Submit declaration - CCCD: {}, citizenId: {}, parcelId: {}, newLand: {}",
                cccdNumber, citizenId, request.getParcelId(), isNewLandOwnership);

        // ===== BUOC 2: Tim thua dat & Validate quyen =====
        LandParcelEntity parcel;
        final Integer parcelId;

        if (isNewLandOwnership) {
            Integer requestedId = request.getParcelId();
            if (requestedId != null) {
                parcel = landParcelJpaRepository.findById(requestedId)
                        .orElseThrow(() -> new RuntimeException("Land parcel not found: " + requestedId));
                parcelId = parcel.getLandParcelId();
            } else {
                String gcn = request.getGcnBookNumber();
                if (gcn == null || gcn.isBlank()) {
                    throw new IllegalArgumentException("Vui lòng nhập số vào sổ cấp GCN để tra cứu thửa đất.");
                }
                parcel = landParcelService.findParcelByGcn(gcn.trim())
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Không tìm thấy thửa đất với GCN: " + gcn.trim()));
                parcelId = parcel.getLandParcelId();
            }
        } else {
            if (request.getParcelId() == null) {
                throw new IllegalArgumentException("Mã thửa đất không được để trống.");
            }
            parcelId = request.getParcelId();
            parcel = landParcelJpaRepository.findById(parcelId)
                    .orElseThrow(() -> new IllegalArgumentException("Land parcel not found: " + parcelId));

            java.util.List<com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandOwnerEntity> owners =
                    landOwnerJpaRepository.findByLandParcelId(parcelId);
            boolean isOwner = owners.stream().anyMatch(o -> o.getCitizenId().equals(citizenId));

            if (!isOwner) {
                log.warn(
                        "Security Warning: CCCD {} attempted to submit declaration for parcel {} not owned by them",
                        cccdNumber, parcelId);
                throw new IllegalArgumentException(
                        "Bạn không có quyền nộp tờ khai cho thửa đất này.");
            }
        }

        // ===== BUOC 3: Tinh thue tu dong (luy tien + mien giam da duyet neu co) =====
        BigDecimal declaredAreaForTax = request.getDeclaredArea();
        java.math.BigDecimal grossTax = taxPaymentAmountService.computeGrossTax(parcel, declaredAreaForTax);
        java.math.BigDecimal taxAmount = taxPayableAmountService.resolvePayableAmount(
                grossTax, citizenId, currentYear);

        // ===== BUOC 4: Luu to khai vao bang records =====
        // Cho phep FE truyen recordCategory (vd "TAX_DECLARATION", "TRANSFER", ...)
        // Neu khong truyen, mac dinh la TAX_DECLARATION.
        String recordCategory = RecordCategories.normalizeCategory(
                (request.getRecordCategory() != null && !request.getRecordCategory().isBlank())
                        ? request.getRecordCategory()
                        : DEFAULT_RECORD_CATEGORY);

        RecordEntity record = RecordEntity.builder()
                .citizenId(citizenId)
                .landParcelId(parcelId)
                .recordCategory(recordCategory)
                .currentStatus("SUBMITTED")
                .build();

        RecordEntity savedRecord = recordJpaRepository.save(record);
        log.info("Record created: recordId={}, category={}, status=SUBMITTED",
                savedRecord.getRecordId(), recordCategory);

        // ===== BUOC 5: Tao ban ghi tax_payments =====
        TaxPaymentEntity taxPayment = TaxPaymentEntity.builder()
                .recordId(savedRecord.getRecordId())
                .landParcelId(parcelId)
                .taxYear(currentYear)
                .totalAmountDue(taxAmount)
                .dueDate(LocalDate.of(currentYear, 12, 31))
                .paymentStatus("UNPAID")
                .build();

        TaxPaymentEntity savedPayment = taxPaymentJpaRepository.save(taxPayment);
        paymentService.generateTransactionCode(savedPayment);
        log.info("Tax payment created: payId={}, amount={} VND, transactionCode={}", savedPayment.getPayId(),
                savedPayment.getTotalAmountDue(), savedPayment.getTransactionCode());

        // ===== BUOC 6: Xu ly file dinh kem =====
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
                for (Long docId : request.getAttachmentIds()) {
                    recordDocumentJpaRepository.findById(docId).ifPresent(doc -> {
                        doc.setRecordId(savedRecord.getRecordId().longValue());
                        recordDocumentJpaRepository.save(doc);
                    });
                }
                log.info("Linked {} documents to recordId={}", request.getAttachmentIds().size(), savedRecord.getRecordId());
            }

        // ===== BUOC 6.5: Luu to khai chi tiet (tax_declarations) =====
        BigDecimal actualArea = parcel.getAreaSize();
        BigDecimal declaredArea = request.getDeclaredArea();

        // Muc dich su dung do nguoi dan ke khai - fallback ve usage_type cua parcel
        String declaredUsage = (request.getDeclaredUsage() != null && !request.getDeclaredUsage().isBlank())
                ? request.getDeclaredUsage().trim()
                : parcel.getUsageType();

        // Ghi chu chenh lech dien tich (neu co) — giu trang thai SUBMITTED cho can bo doi chieu
        String status = "SUBMITTED";
        String areaMismatchNote = null;

        if (actualArea != null && declaredArea != null) {
            BigDecimal diff = actualArea.subtract(declaredArea).abs();
            BigDecimal threshold = actualArea.multiply(new BigDecimal("0.02"));
            if (diff.compareTo(threshold) > 0) {
                areaMismatchNote = "Ghi chú: Diện tích khai báo (" + declaredArea
                        + " m²) chênh lệch so với sổ địa chính (" + actualArea + " m²). "
                        + "Cán bộ sẽ đối chiếu khi xử lý hồ sơ.";
                log.info("Area mismatch note for parcel {}: Declared={}, Actual={}",
                        parcelId, declaredArea, actualArea);
            }
        }

        // Gop ghi chu cua nguoi dan + ghi chu chenh lech (neu co)
        String userNote = request.getDeclarationNotes();
        String mergedNotes;
        if (userNote != null && !userNote.isBlank() && areaMismatchNote != null) {
            mergedNotes = userNote.trim() + " | " + areaMismatchNote;
        } else if (userNote != null && !userNote.isBlank()) {
            mergedNotes = userNote.trim();
        } else {
            mergedNotes = areaMismatchNote;
        }

        // Luu ban ghi tax_declarations.
        // Luu y: thong tin tinh trong land_parcels (parcel_number, area_size, dia
        // chi, GCN, ...) la du lieu cua co quan dia chinh, KHONG bi ghi de tu API
        // nay - chi co bang tax_declarations + records cap nhat.
        com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxDeclarationEntity declaration = com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxDeclarationEntity
                .builder()
                .recordId(savedRecord.getRecordId())
                .declaredArea(declaredArea)
                .declaredUsage(declaredUsage)
                .declarationNotes(mergedNotes)
                .build();
        com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxDeclarationEntity savedDeclaration = taxDeclarationRepository.save(declaration);

        // Ghi log he thong
        auditLogService.log("SUBMIT_DECLARATION", "TAX_DECLARATION",
                String.valueOf(savedRecord.getRecordId()),
                "Citizen submitted tax declaration for parcel " + parcelId
                        + (areaMismatchNote != null ? " - " + areaMismatchNote : ""));

        // ===== BUOC 7: Tra ve response day du =====
        // Gan record vao entity declaration de mapToResponse co the JOIN
        savedDeclaration.setRecord(savedRecord);
        TaxDeclarationResponse response = taxDeclarationService.mapToResponse(savedDeclaration);
        response.setStatus(status);
        try {
            notificationService.createNotification(
                    citizenId,
                    "Nộp hồ sơ thành công",
                    "Hồ sơ #" + savedRecord.getRecordId() + " đã được tiếp nhận, đang chờ cán bộ địa chính xử lý.",
                    "DECLARATION_SUBMITTED");
        } catch (RuntimeException ex) {
            log.warn("Notification failed after submit recordId={}: {}", savedRecord.getRecordId(), ex.getMessage());
        }
        return response;
    }
}
