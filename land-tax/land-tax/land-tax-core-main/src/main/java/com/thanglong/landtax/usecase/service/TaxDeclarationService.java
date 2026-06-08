package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandTypeEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxDeclarationEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandTypeJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxDeclarationRepository;
import com.thanglong.landtax.usecase.dto.TaxDeclarationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.thanglong.landtax.domain.service.NotificationService;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service tra cuu to khai thue dat.
 *
 * <p>Tra ve {@link TaxDeclarationResponse} day du - JOIN tu cac bang:</p>
 * <ul>
 * 
 *   <li>{@code tax_declarations} (du lieu khai bao)</li>
 *   <li>{@code records} (status + record_category)</li>
 *   <li>{@code land_parcels} (so thua, to ban do, dien tich thuc te, dia chi, ...)</li>
 *   <li>{@code land_types} (ten loai dat)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class TaxDeclarationService {

    private final TaxDeclarationRepository repository;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository citizenLocalRepository;
    private final LandParcelJpaRepository landParcelRepository;
    private final LandTypeJpaRepository landTypeRepository;
    private final NotificationService notificationService;
    /** Expose repository for direct use by TaxController. */
    public TaxDeclarationRepository getRepository() {
        return repository;
    }

    @Transactional(readOnly = true)
    public List<TaxDeclarationResponse> getMyHistory(String cccd) {
        log.info("Fetching history for CCCD: {}", cccd);

        Integer citizenId = getCitizenIdByCccd(cccd);

        List<TaxDeclarationEntity> entities = repository.findByRecordCitizenIdOrderByCreatedAtDesc(citizenId);

        return entities.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaxDeclarationResponse getDeclarationById(Integer id, String currentCccd) {
        log.info("Fetching declaration details for record: {} for CCCD: {}", id, currentCccd);

        TaxDeclarationEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tax declaration not found"));

        Integer currentCitizenId = getCitizenIdByCccd(currentCccd);
        if (!java.util.Objects.equals(entity.getRecord().getCitizenId(), currentCitizenId)) {
            log.warn("Security warning: CCCD {} attempted to view declaration {} belonging to citizen {}",
                    currentCccd, id, entity.getRecord().getCitizenId());
            throw new AccessDeniedException("You do not have permission to view this record");
        }

        return mapToResponse(entity);
    }

    /**
     * Map {@link TaxDeclarationEntity} sang {@link TaxDeclarationResponse} day du -
     * join thong tin tu {@code land_parcels} va {@code land_types}.
     */
    public TaxDeclarationResponse mapToResponse(TaxDeclarationEntity entity) {
        RecordEntity record = entity.getRecord();

        TaxDeclarationResponse.TaxDeclarationResponseBuilder builder = TaxDeclarationResponse.builder()
                .recordId(entity.getRecordId())
                .declaredArea(entity.getDeclaredArea())
                .declaredUsage(entity.getDeclaredUsage())
                .declarationNotes(entity.getDeclarationNotes())
                .createdAt(entity.getCreatedAt());

        if (record != null) {
            builder.citizenId(record.getCitizenId())
                    .parcelId(record.getLandParcelId())
                    .recordCategory(record.getRecordCategory())
                    .status(record.getCurrentStatus());

            // Join land_parcels + land_types
            if (record.getLandParcelId() != null) {
                LandParcelEntity parcel = landParcelRepository.findById(record.getLandParcelId()).orElse(null);
                if (parcel != null) {
                    builder.parcelNumber(parcel.getParcelNumber())
                            .mapSheetNumber(parcel.getMapSheetNumber())
                            .areaSize(parcel.getAreaSize())
                            .usageDuration(parcel.getUsageDuration())
                            .usageType(parcel.getUsageType())
                            .address(parcel.getAddress())
                            .usageOrigin(parcel.getUsageOrigin())
                            .gcnBookNumber(parcel.getGcnBookNumber())
                            .certificateNumber(parcel.getCertificateNumber())
                            .attachedHouse(parcel.getAttachedHouse())
                            .attachedOther(parcel.getAttachedOther());

                    if (parcel.getLandTypeId() != null) {
                        LandTypeEntity landType = landTypeRepository.findById(parcel.getLandTypeId()).orElse(null);
                        if (landType != null) {
                            builder.landTypeName(landType.getTypeName());
                        }
                    }
                }
            }
        }

        return builder.build();
    }

    @Transactional
    public void cancelDeclaration(Integer id, String cccd) {
        if (id == null || cccd == null) {
            throw new IllegalArgumentException("Invalid input data (null)");
        }

        TaxDeclarationEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tax declaration not found"));

        Integer currentCitizenId = getCitizenIdByCccd(cccd);
        if (!java.util.Objects.equals(currentCitizenId, entity.getRecord().getCitizenId())) {
            throw new RuntimeException("You do not have permission to cancel this declaration");
        }

        if (!"PENDING".equals(entity.getRecord().getCurrentStatus()) && 
            !"SUBMITTED".equals(entity.getRecord().getCurrentStatus())) {
            throw new IllegalArgumentException("Only PENDING or SUBMITTED declarations can be cancelled");
        }

        entity.getRecord().setCurrentStatus("CANCELLED");
        repository.save(entity);
        notificationService.createNotification(
            entity.getRecord().getCitizenId(),
            "Ho so da duoc huy",
            "Ho so #" + entity.getRecord().getRecordId() + " da duoc huy thanh cong.",
            "DECLARATION_CANCELLED"
        );
        log.info("Cancelled declaration {} for CCCD {}", id, cccd);
    }

    private Integer getCitizenIdByCccd(String cccd) {
        return citizenLocalRepository.findByCccdNumber(cccd)
                .map(com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity::getCitizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found for CCCD: " + cccd));
    }
}
