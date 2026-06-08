package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.service.AccountLookupService;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AccountEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ProcessingLogEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ProcessingLogJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Cán bộ thuế tiếp nhận hồ sơ sau khi cán bộ địa chính xác minh (VERIFIED → PROCESSING).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class ReceiveTaxRecordUseCase {

    private final RecordJpaRepository recordJpaRepository;
    private final ProcessingLogJpaRepository processingLogJpaRepository;
    private final SyncUserFromVneidUseCase syncUserFromVneidUseCase;
    private final AuditLogService auditLogService;
    private final AccountLookupService accountLookupService;

    @Transactional
    public Map<String, Object> receiveTaxRecord(Integer recordId) {
        String cccdNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        Integer officerCitizenId = syncUserFromVneidUseCase.syncAndGetCitizenId(cccdNumber);
        AccountEntity officerAccount = accountLookupService.requireProcessorAccount(officerCitizenId);

        RecordEntity record = recordJpaRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ: " + recordId));

        String oldStatus = record.getCurrentStatus();
        if (!"VERIFIED".equals(oldStatus)) {
            throw new RuntimeException(
                    "Chỉ có thể tiếp nhận hồ sơ ở trạng thái VERIFIED. Trạng thái hiện tại: " + oldStatus);
        }

        record.setCurrentStatus("PROCESSING");
        recordJpaRepository.save(record);

        ProcessingLogEntity processingLog = ProcessingLogEntity.builder()
                .recordId(recordId)
                .processorAccountId(officerAccount.getAccountId())
                .processingStep("RECEIVE")
                .oldStatus(oldStatus)
                .newStatus("PROCESSING")
                .processorNotes("Cán bộ thuế tiếp nhận hồ sơ")
                .build();
        processingLogJpaRepository.save(processingLog);

        auditLogService.log("RECEIVE_TAX_RECORD", "TAX_DECLARATION", String.valueOf(recordId),
                "Cán bộ thuế " + cccdNumber + " tiếp nhận hồ sơ " + recordId);

        log.info("Tax officer {} received record {}: VERIFIED -> PROCESSING", cccdNumber, recordId);

        return Map.of(
                "recordId", recordId,
                "oldStatus", oldStatus,
                "newStatus", "PROCESSING",
                "message", "Tiếp nhận hồ sơ thành công");
    }
}
