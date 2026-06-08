package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.service.AccountLookupService;
import com.thanglong.landtax.domain.service.NotificationService;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AccountEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ProcessingLogEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxPaymentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ProcessingLogJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxDeclarationRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import com.thanglong.landtax.usecase.dto.CadastralCompareResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class VerifyDeclarationUseCase {

    /** Trạng thái DB cho phép cán bộ địa chính tiếp nhận & xác minh. */
    private static final Set<String> RECEIVABLE_STATUSES = Set.of(
            "SUBMITTED", "PENDING", "FRAUD_SUSPECTED");

    private final RecordJpaRepository recordJpaRepository;
    private final AuditLogService auditLogService;
    private final CadastralCompareService cadastralCompareService;
    private final NotificationService notificationService;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final ProcessingLogJpaRepository processingLogJpaRepository;
    private final SyncUserFromVneidUseCase syncUserFromVneidUseCase;
    private final AccountLookupService accountLookupService;

    @Transactional
    public Map<String, Object> verifyDeclaration(Integer recordId) {
        String officerCccd = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("LAND_OFFICER {} đang tiếp nhận & xác minh hồ sơ {}", officerCccd, recordId);

        RecordEntity record = recordJpaRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ không tồn tại: " + recordId));

        String oldStatus = record.getCurrentStatus();
        if (!RECEIVABLE_STATUSES.contains(oldStatus)) {
            throw new RuntimeException(
                    "Chỉ có thể tiếp nhận hồ sơ ở trạng thái SUBMITTED, PENDING hoặc FRAUD_SUSPECTED. "
                            + "Trạng thái hiện tại: " + oldStatus);
        }

        CadastralCompareResult compareResult = cadastralCompareService.compareRecord(record);
        if (compareResult.isHasMismatch()) {
            return rejectForCadastralMismatch(record, oldStatus, officerCccd, compareResult);
        }

        record.setCurrentStatus("VERIFIED");
        recordJpaRepository.save(record);

        auditLogService.log("VERIFY_DECLARATION", "TAX_DECLARATION",
                String.valueOf(recordId),
                "Cán bộ địa chính " + officerCccd + " đã xác minh hồ sơ " + recordId + " hợp lệ");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("recordId", recordId);
        response.put("status", "VERIFIED");
        response.put("oldStatus", oldStatus);
        response.put("message", "Hồ sơ đã được tiếp nhận và xác minh thành công");
        response.put("hasMismatch", false);
        return response;
    }

    private Map<String, Object> rejectForCadastralMismatch(RecordEntity record,
            String oldStatus,
            String officerCccd,
            CadastralCompareResult compareResult) {
        Integer recordId = record.getRecordId();
        String mismatchSummary = compareResult.getSummaryMessage();

        record.setCurrentStatus("REJECTED");
        recordJpaRepository.save(record);

        taxDeclarationRepository.findByRecordId(recordId).ifPresent(declaration -> {
            String existingNotes = declaration.getDeclarationNotes();
            String rejectNote = "Từ chối do không khớp sổ địa chính: " + mismatchSummary;
            if (existingNotes != null && !existingNotes.isBlank()) {
                declaration.setDeclarationNotes(existingNotes.trim() + " | " + rejectNote);
            } else {
                declaration.setDeclarationNotes(rejectNote);
            }
            taxDeclarationRepository.save(declaration);
        });

        List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordId(recordId);
        for (TaxPaymentEntity payment : payments) {
            payment.setPaymentStatus("CANCELLED");
            taxPaymentJpaRepository.save(payment);
        }

        Integer officerCitizenId = syncUserFromVneidUseCase.syncAndGetCitizenId(officerCccd);
        AccountEntity officerAccount = accountLookupService.requireProcessorAccount(officerCitizenId);

        ProcessingLogEntity processingLog = ProcessingLogEntity.builder()
                .recordId(recordId)
                .processorAccountId(officerAccount.getAccountId())
                .processingStep("REJECT_CADASTRAL_FRAUD")
                .oldStatus(oldStatus)
                .newStatus("REJECTED")
                .processorNotes(mismatchSummary)
                .build();
        processingLogJpaRepository.save(processingLog);

        notificationService.notifyCadastralFraudRejected(
                record.getCitizenId(), recordId, compareResult.getMismatchMessages());

        auditLogService.log("REJECT_CADASTRAL_FRAUD", "TAX_DECLARATION",
                String.valueOf(recordId),
                "Cán bộ địa chính " + officerCccd + " từ chối hồ sơ " + recordId
                        + " do: " + mismatchSummary);

        log.warn("Record {} REJECTED (cadastral mismatch): {}", recordId, mismatchSummary);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("recordId", recordId);
        response.put("status", "REJECTED");
        response.put("oldStatus", oldStatus);
        response.put("hasMismatch", true);
        response.put("mismatches", compareResult.getMismatches());
        response.put("mismatchMessages", compareResult.getMismatchMessages());
        response.put("mismatchSummary", mismatchSummary);
        response.put("message",
                "Hồ sơ bị từ chối do thông tin khai báo không khớp sổ địa chính. "
                        + "Công dân đã được thông báo và cần tạo hồ sơ mới.");
        return response;
    }
}
