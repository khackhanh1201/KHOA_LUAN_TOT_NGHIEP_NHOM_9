package com.thanglong.landtax.usecase.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ReconciliationLogEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ReconciliationLogJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Ghi log doi soat — transaction rieng de loi phu khong rollback cap nhat PAID.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReconciliationLogService {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final ReconciliationLogJpaRepository reconciliationLogJpaRepository;

    public static String manualSyncPayload(int payId, String orderCode) {
        return String.format(
                "{\"source\":\"MANUAL_SYNC\",\"payId\":%d,\"orderCode\":\"%s\"}",
                payId, orderCode);
    }

    /**
     * Chuan hoa payload thanh JSON hop le (cot webhook_payload co CHECK json_valid).
     */
    public static String toValidJsonPayload(String webhookPayload) {
        if (webhookPayload == null || webhookPayload.isBlank()) {
            return "{\"source\":\"unknown\"}";
        }
        String trimmed = webhookPayload.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            try {
                JSON.readTree(trimmed);
                return trimmed;
            } catch (JsonProcessingException ignored) {
                // fall through — wrap as JSON object
            }
        }
        try {
            Map<String, String> wrapper = new LinkedHashMap<>();
            wrapper.put("source", trimmed);
            return JSON.writeValueAsString(wrapper);
        } catch (JsonProcessingException e) {
            return "{\"source\":\"unknown\"}";
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveMatchedLog(String orderCode, BigDecimal amountReceived, String webhookPayload) {
        String jsonPayload = toValidJsonPayload(webhookPayload);
        ReconciliationLogEntity reconLog = ReconciliationLogEntity.builder()
                .transactionCode(orderCode)
                .amountReceived(amountReceived != null ? amountReceived : BigDecimal.ZERO)
                .status("MATCHED")
                .webhookPayload(jsonPayload)
                .build();
        reconciliationLogJpaRepository.save(reconLog);
        log.info("Reconciliation log saved: orderCode={}, amount={}, status=MATCHED",
                orderCode, amountReceived);
    }
}
