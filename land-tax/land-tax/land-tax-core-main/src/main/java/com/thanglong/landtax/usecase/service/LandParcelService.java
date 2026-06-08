package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandOwnerEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandTypeEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandTypeJpaRepository;
import com.thanglong.landtax.usecase.dto.LandParcelDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class LandParcelService {

    private final LandParcelJpaRepository landParcelJpaRepository;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandOwnerJpaRepository landOwnerJpaRepository;
    private final LandTypeJpaRepository landTypeJpaRepository;

    public List<LandParcelDTO> getMyLandParcels(String cccd) {
        log.info("Fetching land parcels for CCCD: {}", cccd);
        
        Integer citizenId = citizenLocalJpaRepository.findByCccdNumber(cccd)
                .map(com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity::getCitizenId)
                .orElse(null);
                
        if (citizenId == null) {
            log.warn("Citizen not found for CCCD: {}", cccd);
            System.out.println(">>> [DEBUG] Citizen not found for CCCD: " + cccd);
            return List.of();
        }
        
        System.out.println(">>> [DEBUG] Found citizenId: " + citizenId + " for CCCD: " + cccd);
        
        List<com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandOwnerEntity> ownerships = landOwnerJpaRepository.findByCitizenId(citizenId);
        System.out.println(">>> [DEBUG] Found " + ownerships.size() + " ownership records in land_owners for citizenId: " + citizenId);

        List<Integer> parcelIds = ownerships.stream()
                .map(com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandOwnerEntity::getLandParcelId)
                .collect(Collectors.toList());
        
        System.out.println(">>> [DEBUG] Parcel IDs extracted from land_owners: " + parcelIds);

        List<LandParcelEntity> parcels = landParcelJpaRepository.findAllById(parcelIds);
        
        System.out.println(">>> [DEBUG] Found " + parcels.size() + " actual parcels in land_parcels table");
        
        if (parcels.isEmpty()) {
            log.warn("No land parcels found for CCCD: {}", cccd);
        } else {
            log.info("Found {} land parcels for CCCD: {}", parcels.size(), cccd);
        }
        
        return parcels.stream()
                .map(p -> convertToDTO(p, cccd))
                .collect(Collectors.toList());
    }

    public List<LandParcelEntity> getAllParcels() {
        return landParcelJpaRepository.findAll();
    }

    public Optional<LandParcelEntity> getParcelById(Integer id) {
        return landParcelJpaRepository.findById(id);
    }

    @Transactional
    public LandParcelEntity createParcel(LandParcelEntity entity) {
        log.info("Creating new land parcel: {}", entity.getParcelNumber());
        return landParcelJpaRepository.save(entity);
    }

    /**
     * Tra cuu thua dat theo GCN neu chua co chu (phuc vu khai bao dat moi).
     * Neu co nhieu ban ghi cung GCN, uu tien thua chua co chu trong land_owners.
     */
    public Optional<LandParcelEntity> findUnownedParcelByGcn(String gcnBookNumber) {
        if (gcnBookNumber == null || gcnBookNumber.isBlank()) {
            return Optional.empty();
        }
        String normalized = gcnBookNumber.trim();
        List<LandParcelEntity> matches = landParcelJpaRepository.findAllByGcnBookNumberIgnoreCase(normalized);
        if (matches.isEmpty()) {
            return Optional.empty();
        }
        return matches.stream()
                .filter(p -> landOwnerJpaRepository.findByLandParcelId(p.getLandParcelId()).isEmpty())
                .findFirst();
    }

    /** Tra cuu thua dat theo GCN (co hoac chua co chu) — phuc vu khai bao / doi chieu. */
    public Optional<LandParcelEntity> findParcelByGcn(String gcnBookNumber) {
        if (gcnBookNumber == null || gcnBookNumber.isBlank()) {
            return Optional.empty();
        }
        List<LandParcelEntity> matches = landParcelJpaRepository
                .findAllByGcnBookNumberIgnoreCase(gcnBookNumber.trim());
        return matches.stream().findFirst();
    }

    /** Thua dat co GCN nhung da co chu (de tra thong bao ro hon). */
    public boolean isGcnOwnedBySomeoneElse(String gcnBookNumber) {
        if (gcnBookNumber == null || gcnBookNumber.isBlank()) {
            return false;
        }
        List<LandParcelEntity> matches = landParcelJpaRepository
                .findAllByGcnBookNumberIgnoreCase(gcnBookNumber.trim());
        if (matches.isEmpty()) {
            return false;
        }
        boolean hasUnowned = matches.stream()
                .anyMatch(p -> landOwnerJpaRepository.findByLandParcelId(p.getLandParcelId()).isEmpty());
        return !hasUnowned;
    }

    /**
     * Gan chu so huu chinh sau khi duyet ho so khai bao dat moi.
     */
    @Transactional
    public void assignPrimaryOwner(Integer citizenId, Integer landParcelId) {
        if (citizenId == null || landParcelId == null) {
            throw new IllegalArgumentException("citizenId va landParcelId khong duoc null");
        }
        landParcelJpaRepository.findById(landParcelId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay thua dat: " + landParcelId));

        List<LandOwnerEntity> existing = landOwnerJpaRepository.findByLandParcelId(landParcelId);
        if (!existing.isEmpty()) {
            boolean alreadyOwner = existing.stream()
                    .anyMatch(o -> o.getCitizenId().equals(citizenId));
            if (alreadyOwner) {
                log.info("Citizen {} da la chu thua dat {}", citizenId, landParcelId);
                return;
            }
            throw new RuntimeException("Thua dat da co chu so huu khac, khong the gan them");
        }

        LandOwnerEntity owner = LandOwnerEntity.builder()
                .citizenId(citizenId)
                .landParcelId(landParcelId)
                .ownershipType("PRIMARY")
                .build();
        landOwnerJpaRepository.save(owner);
        log.info("Assigned PRIMARY owner citizenId={} to parcelId={}", citizenId, landParcelId);
    }

    @Transactional
    public LandParcelEntity updateParcel(Integer id, LandParcelEntity updatedEntity) {
        if (updatedEntity == null) {
            throw new IllegalArgumentException("Updated land parcel data cannot be null");
        }
        log.info("Updating land parcel ID: {}", id);
        return landParcelJpaRepository.findById(id).map(existing -> {
            if (updatedEntity.getAddress() != null) {
                existing.setAddress(updatedEntity.getAddress());
            }
            if (updatedEntity.getAreaSize() != null) {
                existing.setAreaSize(updatedEntity.getAreaSize());
            }
            if (updatedEntity.getLandTypeId() != null) {
                existing.setLandTypeId(updatedEntity.getLandTypeId());
            }
            if (updatedEntity.getAreaId() != null) {
                existing.setAreaId(updatedEntity.getAreaId());
            }
            if (updatedEntity.getMapSheetNumber() != null) {
                existing.setMapSheetNumber(updatedEntity.getMapSheetNumber());
            }
            if (updatedEntity.getParcelNumber() != null) {
                existing.setParcelNumber(updatedEntity.getParcelNumber());
            }
            if (updatedEntity.getAttachedHouse() != null) {
                existing.setAttachedHouse(updatedEntity.getAttachedHouse());
            }
            if (updatedEntity.getAttachedOther() != null) {
                existing.setAttachedOther(updatedEntity.getAttachedOther());
            }
            if (updatedEntity.getUsageDuration() != null) {
                existing.setUsageDuration(updatedEntity.getUsageDuration());
            }
            if (updatedEntity.getUsageType() != null) {
                existing.setUsageType(updatedEntity.getUsageType());
            }
            if (updatedEntity.getUsageOrigin() != null) {
                existing.setUsageOrigin(updatedEntity.getUsageOrigin());
            }
            if (updatedEntity.getNotes() != null) {
                existing.setNotes(updatedEntity.getNotes());
            }
            return landParcelJpaRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Land parcel not found with ID " + id));
    }
    
    @Transactional
    public void deleteParcel(Integer id) {
        landParcelJpaRepository.deleteById(id);
    }

    public boolean isOwner(Integer parcelId, String cccd) {
        Integer citizenId = citizenLocalJpaRepository.findByCccdNumber(cccd)
                .map(com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity::getCitizenId)
                .orElse(null);
        if (citizenId == null) return false;
        
        return landOwnerJpaRepository.findByLandParcelId(parcelId).stream()
                .anyMatch(o -> o.getCitizenId().equals(citizenId));
    }

    public Optional<Map<String, Object>> getParcelDetailByGcn(String gcnBookNumber) {
        if (gcnBookNumber == null || gcnBookNumber.isBlank()) {
            return Optional.empty();
        }
        return landParcelJpaRepository.findByGcnBookNumberIgnoreCase(gcnBookNumber.trim())
                .map(this::buildParcelDetailMap);
    }

    public List<Map<String, Object>> getParcelOwners(Integer parcelId) {
        List<LandOwnerEntity> owners = landOwnerJpaRepository.findByLandParcelId(parcelId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (LandOwnerEntity owner : owners) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("citizenId", owner.getCitizenId());
            row.put("ownershipType", owner.getOwnershipType());
            citizenLocalJpaRepository.findById(owner.getCitizenId()).ifPresent(c -> {
                row.put("cccdNumber", c.getCccdNumber());
                row.put("fullName", c.getFullName());
            });
            result.add(row);
        }
        return result;
    }

    public Map<String, Object> buildParcelDetailMap(LandParcelEntity entity) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("landParcelId", entity.getLandParcelId());
        map.put("parcelNumber", entity.getParcelNumber());
        map.put("mapSheetNumber", entity.getMapSheetNumber());
        map.put("areaSize", entity.getAreaSize());
        map.put("landTypeId", entity.getLandTypeId());
        map.put("areaId", entity.getAreaId());
        map.put("usageDuration", entity.getUsageDuration());
        map.put("usageType", entity.getUsageType());
        map.put("usageOrigin", entity.getUsageOrigin());
        map.put("address", entity.getAddress());
        map.put("gcnBookNumber", entity.getGcnBookNumber());
        map.put("certificateNumber", entity.getCertificateNumber());
        map.put("notes", entity.getNotes());
        map.put("attachedHouse", entity.getAttachedHouse());
        map.put("attachedOther", entity.getAttachedOther());

        if (entity.getLandTypeId() != null) {
            landTypeJpaRepository.findById(entity.getLandTypeId())
                    .map(LandTypeEntity::getTypeName)
                    .ifPresent(name -> map.put("landTypeName", name));
        }
        List<Map<String, Object>> owners = getParcelOwners(entity.getLandParcelId());
        map.put("owners", owners);
        if (!owners.isEmpty()) {
            Map<String, Object> firstOwner = owners.get(0);
            map.put("ownerName", firstOwner.get("fullName"));
            map.put("fullName", firstOwner.get("fullName"));
            map.put("ownerCccd", firstOwner.get("cccdNumber"));
        }
        return map;
    }

    private LandParcelDTO convertToDTO(LandParcelEntity entity, String ownerCccd) {
        if (entity == null) {
            return null;
        }
        
        System.out.println(">>> [DEBUG] Entity tr  c khi map: " + entity.toString());
        
        LandParcelDTO dto = LandParcelDTO.builder()
                .landParcelId(entity.getLandParcelId())
                .landTypeId(entity.getLandTypeId())
                .landTypeName(resolveLandTypeName(entity.getLandTypeId()))
                .areaId(entity.getAreaId())
                .parcelNumber(entity.getParcelNumber())
                .mapSheetNumber(entity.getMapSheetNumber())
                .areaSize(entity.getAreaSize())
                .usageDuration(entity.getUsageDuration())
                .usageType(entity.getUsageType())
                .usageOrigin(entity.getUsageOrigin())
                .address(entity.getAddress())
                .certificateNumber(entity.getCertificateNumber())
                .gcnBookNumber(entity.getGcnBookNumber())
                .notes(entity.getNotes())
                .attachedHouse(entity.getAttachedHouse())
                .attachedOther(entity.getAttachedOther())
                .ownerCccd(ownerCccd)
                .build();
                
        System.out.println(">>> [DEBUG MAPPER] Parcel DTO AFTER Mapping: " + dto.toString());
        
        return dto;
    }

    private String resolveLandTypeName(Integer landTypeId) {
        if (landTypeId == null) {
            return null;
        }
        return landTypeJpaRepository.findById(landTypeId)
                .map(LandTypeEntity::getTypeName)
                .orElse(null);
    }
}
