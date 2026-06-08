package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.RecordCategories;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandTypeEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.TaxDeclarationEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandTypeJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxDeclarationRepository;
import com.thanglong.landtax.usecase.dto.CadastralCompareResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Đối chiếu dữ liệu khai báo trên hồ sơ với sổ địa chính (theo GCN).
 */
@Service
@RequiredArgsConstructor
public class CadastralCompareService {

    private static final Map<String, String> MISMATCH_LABELS = Map.ofEntries(
            Map.entry("areaSize", "Diện tích khai báo không khớp với sổ địa chính"),
            Map.entry("parcelNumber", "Số thửa không khớp với sổ địa chính"),
            Map.entry("mapSheetNumber", "Số tờ bản đồ không khớp với sổ địa chính"),
            Map.entry("landTypeId", "Loại đất không khớp với sổ địa chính"),
            Map.entry("address", "Địa chỉ không khớp với sổ địa chính"),
            Map.entry("owner", "Chủ sở hữu không khớp với sổ địa chính"),
            Map.entry("parcelLink", "Liên kết thửa đất không khớp với sổ địa chính"),
            Map.entry("gcnNotFound", "Không tìm thấy thửa trên sổ theo số GCN"));

    private final LandParcelService landParcelService;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final LandTypeJpaRepository landTypeJpaRepository;

    public CadastralCompareResult compareRecord(RecordEntity record) {
        LandParcelEntity declaredParcel = landParcelService.getParcelById(record.getLandParcelId())
                .orElse(null);
        if (declaredParcel == null) {
            return buildSingleMismatch("gcnNotFound");
        }

        String gcn = declaredParcel.getGcnBookNumber();
        if (gcn == null || gcn.isBlank()) {
            return buildSingleMismatch("gcnNotFound");
        }

        Optional<LandParcelEntity> masterOpt =
                landParcelJpaRepository.findByGcnBookNumberIgnoreCase(gcn.trim());
        if (masterOpt.isEmpty()) {
            return buildSingleMismatch("gcnNotFound");
        }

        LandParcelEntity master = masterOpt.get();
        TaxDeclarationEntity declaration = taxDeclarationRepository.findByRecordId(record.getRecordId())
                .orElse(null);

        BigDecimal declaredArea = declaration != null && declaration.getDeclaredArea() != null
                ? declaration.getDeclaredArea()
                : declaredParcel.getAreaSize();

        String declaredUsage = declaration != null && declaration.getDeclaredUsage() != null
                ? declaration.getDeclaredUsage()
                : declaredParcel.getUsageType();

        String landTypeName = resolveLandTypeName(declaredParcel.getLandTypeId());
        boolean skipOwnerCheck = RecordCategories.isLandOwnershipNew(record.getRecordCategory());

        Integer citizenId = record.getCitizenId();
        String cccd = citizenLocalJpaRepository.findById(citizenId)
                .map(CitizenLocalEntity::getCccdNumber)
                .orElse(null);

        LinkedHashMap<String, Boolean> mismatches = new LinkedHashMap<>();

        flag(mismatches, "parcelNumber",
                norm(declaredParcel.getParcelNumber()).equals(norm(master.getParcelNumber())));
        flag(mismatches, "mapSheetNumber",
                norm(declaredParcel.getMapSheetNumber()).equals(norm(master.getMapSheetNumber())));

        double dArea = declaredArea != null ? declaredArea.doubleValue() : Double.NaN;
        double mArea = master.getAreaSize() != null ? master.getAreaSize().doubleValue() : Double.NaN;
        flag(mismatches, "areaSize",
                !Double.isNaN(dArea) && !Double.isNaN(mArea) && Math.abs(dArea - mArea) < 0.01);

        String dType = norm(landTypeName != null ? landTypeName : declaredUsage);
        String mType = norm(resolveLandTypeName(master.getLandTypeId()));
        if (mType.isEmpty()) {
            mType = norm(master.getUsageType());
        }
        Integer dTypeId = declaredParcel.getLandTypeId();
        Integer mTypeId = master.getLandTypeId();
        boolean typeOk = (dTypeId != null && mTypeId != null && dTypeId.equals(mTypeId))
                || dType.equals(mType)
                || (!dType.isEmpty() && !mType.isEmpty()
                        && (dType.contains(mType) || mType.contains(dType)));
        flag(mismatches, "landTypeId", typeOk);

        flag(mismatches, "address",
                norm(declaredParcel.getAddress()).equals(norm(master.getAddress())));

        if (!skipOwnerCheck) {
            List<Map<String, Object>> owners = landParcelService.getParcelOwners(master.getLandParcelId());
            boolean ownerOk = owners.stream().anyMatch(o ->
                    citizenId != null && citizenId.equals(asInt(o.get("citizenId")))
                            || (cccd != null && norm(cccd).equals(norm(String.valueOf(o.get("cccdNumber"))))));
            flag(mismatches, "owner", ownerOk);
        }

        if (!skipOwnerCheck
                && master.getLandParcelId() != null
                && record.getLandParcelId() != null
                && !master.getLandParcelId().equals(record.getLandParcelId())) {
            mismatches.put("parcelLink", true);
            mismatches.put("parcelNumber", true);
            mismatches.put("mapSheetNumber", true);
        }

        if (mismatches.isEmpty()) {
            return CadastralCompareResult.ok();
        }

        List<String> messages = new ArrayList<>();
        for (String key : mismatches.keySet()) {
            messages.add(MISMATCH_LABELS.getOrDefault(key, key));
        }
        return CadastralCompareResult.withMismatches(mismatches, messages);
    }

    private CadastralCompareResult buildSingleMismatch(String key) {
        LinkedHashMap<String, Boolean> map = new LinkedHashMap<>();
        map.put(key, true);
        String label = MISMATCH_LABELS.getOrDefault(key, key);
        return CadastralCompareResult.withMismatches(map, List.of(label));
    }

    private void flag(LinkedHashMap<String, Boolean> mismatches, String key, boolean ok) {
        if (!ok) {
            mismatches.put(key, true);
        }
    }

    private String norm(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private String resolveLandTypeName(Integer landTypeId) {
        if (landTypeId == null) {
            return null;
        }
        return landTypeJpaRepository.findById(landTypeId)
                .map(LandTypeEntity::getTypeName)
                .orElse(null);
    }

    private Integer asInt(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
