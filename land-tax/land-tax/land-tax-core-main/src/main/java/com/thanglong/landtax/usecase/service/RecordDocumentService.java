package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordDocumentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordDocumentJpaRepository;
import com.thanglong.landtax.usecase.dto.DocumentSummaryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class RecordDocumentService {

    public static final String COMPLAINT_PREFIX = "complaint:";
    public static final String LAND_PRICE_PREFIX = "land-price:";

    private final RecordDocumentJpaRepository recordDocumentJpaRepository;

    @Transactional
    public void linkRecordDocuments(Long recordId, List<Long> documentIds) {
        if (recordId == null || documentIds == null || documentIds.isEmpty()) {
            return;
        }
        for (Long docId : documentIds) {
            recordDocumentJpaRepository.findById(docId).ifPresent(doc -> {
                doc.setRecordId(recordId);
                recordDocumentJpaRepository.save(doc);
            });
        }
    }

    @Transactional
    public void linkComplaintDocuments(Integer complaintId, Integer recordId, List<Long> documentIds) {
        if (complaintId == null || documentIds == null || documentIds.isEmpty()) {
            return;
        }
        String prefix = complaintPrefix(complaintId);
        for (Long docId : documentIds) {
            recordDocumentJpaRepository.findById(docId).ifPresent(doc -> {
                doc.setFileName(prefix + displayFileName(doc.getFileName()));
                if (recordId != null) {
                    doc.setRecordId(recordId.longValue());
                }
                recordDocumentJpaRepository.save(doc);
                log.info("Linked document {} to complaint {}", docId, complaintId);
            });
        }
    }

    @Transactional
    public void linkLandPriceDocument(Integer priceId, Long documentId) {
        if (priceId == null || documentId == null) {
            return;
        }
        recordDocumentJpaRepository.findById(documentId).ifPresent(doc -> {
            doc.setFileName(landPricePrefix(priceId) + displayFileName(doc.getFileName()));
            recordDocumentJpaRepository.save(doc);
            log.info("Linked document {} to land price {}", documentId, priceId);
        });
    }

    public List<RecordDocumentEntity> findComplaintDocuments(Integer complaintId, Integer recordId) {
        Map<Long, RecordDocumentEntity> merged = new LinkedHashMap<>();
        if (complaintId != null) {
            recordDocumentJpaRepository.findByFileNameStartingWith(complaintPrefix(complaintId))
                    .forEach(doc -> merged.put(doc.getDocumentId(), doc));
        }
        if (recordId != null) {
            recordDocumentJpaRepository.findByRecordId(recordId.longValue())
                    .forEach(doc -> merged.put(doc.getDocumentId(), doc));
        }
        return new ArrayList<>(merged.values());
    }

    public List<RecordDocumentEntity> findLandPriceDocuments(Integer priceId) {
        if (priceId == null) {
            return List.of();
        }
        return recordDocumentJpaRepository.findByFileNameStartingWith(landPricePrefix(priceId));
    }

    public List<DocumentSummaryDTO> toSummaries(List<RecordDocumentEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }
        return entities.stream().map(this::toSummary).toList();
    }

    public DocumentSummaryDTO toSummary(RecordDocumentEntity entity) {
        return DocumentSummaryDTO.builder()
                .documentId(entity.getDocumentId())
                .fileName(displayFileName(entity.getFileName()))
                .fileUrl(entity.getFileUrl())
                .fileType(entity.getFileType())
                .build();
    }

    public static String complaintPrefix(int complaintId) {
        return COMPLAINT_PREFIX + complaintId + "/";
    }

    public static String landPricePrefix(int priceId) {
        return LAND_PRICE_PREFIX + priceId + "/";
    }

    public static String displayFileName(String storedName) {
        if (storedName == null) {
            return "—";
        }
        if (storedName.startsWith(COMPLAINT_PREFIX) || storedName.startsWith(LAND_PRICE_PREFIX)) {
            int slash = storedName.indexOf('/');
            if (slash >= 0 && slash + 1 < storedName.length()) {
                return storedName.substring(slash + 1);
            }
        }
        return storedName;
    }
}
