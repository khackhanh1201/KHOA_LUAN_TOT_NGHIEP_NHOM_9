package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.usecase.dto.LandParcelDTO;
import com.thanglong.landtax.usecase.service.LandParcelImportService;
import com.thanglong.landtax.usecase.service.LandParcelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/land-parcels")
@RequiredArgsConstructor
@Slf4j
public class LandParcelController {

    private final LandParcelService landParcelService;
    private final LandParcelImportService landParcelImportService;

    @GetMapping("/my-parcels")
    @PreAuthorize("hasAuthority('ROLE_CITIZEN')")
    public ResponseEntity<List<LandParcelDTO>> getMyLandParcels() {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("GET /api/land-parcels/my-assets  owner_cccd={}", cccd);
        List<LandParcelDTO> myParcels = landParcelService.getMyLandParcels(cccd);
        return ResponseEntity.ok(myParcels);
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    @com.thanglong.landtax.infrastructure.config.aop.AuditLog(action = "Import Excel thua dat")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<?> importLandParcels(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
        }
        try {
            int count = landParcelImportService.importFromExcel(file);
            return ResponseEntity.ok(Map.of("message", "Import thành công", "imported", count));
        } catch (Exception e) {
            log.error("Loi import Excel: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Loi xu ly file Excel: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchParcels(
            @RequestParam(required = false) String mapSheet,
            @RequestParam(required = false) String parcelNumber) {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isOfficer = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ADMIN") || a.getAuthority().contains("OFFICER") || a.getAuthority().contains("LAND_OFFICER"));

        List<LandParcelEntity> results = landParcelService.getAllParcels();
        
        if (mapSheet != null) {
            results = results.stream().filter(p -> mapSheet.equals(p.getMapSheetNumber())).collect(Collectors.toList());
        }
        if (parcelNumber != null) {
            results = results.stream().filter(p -> parcelNumber.equals(p.getParcelNumber())).collect(Collectors.toList());
        }

        if (!isOfficer) {
            results = results.stream()
                    .filter(p -> landParcelService.isOwner(p.getLandParcelId(), cccd))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(Map.of("data", results, "total", results.size()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<?> getAllParcelsForOfficer() {
        List<LandParcelEntity> allParcels = landParcelService.getAllParcels();
        return ResponseEntity.ok(Map.of("data", allParcels, "total", allParcels.size()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<?> getAllParcels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<LandParcelEntity> allParcels = landParcelService.getAllParcels();
        return ResponseEntity.ok(Map.of("content", allParcels, "totalElements", allParcels.size()));
    }

    @GetMapping("/by-gcn")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<?> getParcelByGcn(@RequestParam String gcnBookNumber) {
        log.info("GET /api/land-parcels/by-gcn gcn={}", gcnBookNumber);
        return landParcelService.getParcelDetailByGcn(gcnBookNumber)
                .map(detail -> ResponseEntity.ok(Map.of("data", detail)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cong dan tra cuu thua dat theo GCN (co hoac chua co chu).
     * Cho phep nop ho so khai bao; sai lech se do can bo dia chinh doi chieu sau.
     */
    @GetMapping("/lookup-by-gcn")
    @PreAuthorize("hasAuthority('ROLE_CITIZEN')")
    public ResponseEntity<Map<String, Object>> lookupParcelByGcn(@RequestParam String gcnBookNumber) {
        log.info("GET /api/land-parcels/lookup-by-gcn gcn={}", gcnBookNumber);
        return landParcelService.findParcelByGcn(gcnBookNumber)
                .map(p -> ResponseEntity.ok(Map.<String, Object>of(
                        "data", landParcelService.buildParcelDetailMap(p))))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "error", "NOT_FOUND",
                        "message", "Không tìm thấy thửa đất với số GCN này trên sổ địa chính.")));
    }

    /**
     * Cong dan tra cuu thua dat chua co chu theo so vao so GCN (khai bao dat moi).
     */
    @GetMapping("/lookup-unowned")
    @PreAuthorize("hasAuthority('ROLE_CITIZEN')")
    public ResponseEntity<Map<String, Object>> lookupUnownedParcel(@RequestParam String gcnBookNumber) {
        log.info("GET /api/land-parcels/lookup-unowned gcn={}", gcnBookNumber);
        return landParcelService.findUnownedParcelByGcn(gcnBookNumber)
                .map(p -> ResponseEntity.ok(Map.<String, Object>of("data", landParcelService.buildParcelDetailMap(p))))
                .orElseGet(() -> {
                    String message = landParcelService.isGcnOwnedBySomeoneElse(gcnBookNumber)
                            ? "Thửa đất với số GCN này đã có chủ sở hữu trên sổ địa chính"
                            : "Không tìm thấy thửa đất chưa có chủ với GCN này";
                    return ResponseEntity.status(404).body(Map.of(
                            "error", "NOT_FOUND",
                            "message", message));
                });
    }

    @GetMapping("/{id}/owners")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<?> getParcelOwners(@PathVariable Integer id) {
        if (landParcelService.getParcelById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(landParcelService.getParcelOwners(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getParcelById(@PathVariable Integer id) {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isOfficer = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> {
                    String auth = a.getAuthority();
                    return auth.contains("ADMIN") || auth.contains("LAND_OFFICER") || auth.contains("TAX_OFFICER");
                });

        Optional<LandParcelEntity> parcelOpt = landParcelService.getParcelById(id);
        if (parcelOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LandParcelEntity parcel = parcelOpt.get();
        if (!isOfficer && !landParcelService.isOwner(parcel.getLandParcelId(), cccd)) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden", "message", "Ban khong co quyen xem thua dat nay"));
        }

        if (isOfficer) {
            return ResponseEntity.ok(Map.of("data", landParcelService.buildParcelDetailMap(parcel)));
        }
        return ResponseEntity.ok(Map.of("data", parcel));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<?> createParcel(@RequestBody LandParcelEntity entity) {
        log.info("Tao moi thua dat: {}", entity.getParcelNumber());
        LandParcelEntity created = landParcelService.createParcel(entity);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LAND_OFFICER')")
    public ResponseEntity<?> updateParcel(@PathVariable Integer id, @RequestBody LandParcelEntity updatedEntity) {
        log.info("Cap nhat thua dat ID: {}", id);
        LandParcelEntity updated = landParcelService.updateParcel(id, updatedEntity);
        return ResponseEntity.ok(Map.of(
                "data", landParcelService.buildParcelDetailMap(updated),
                "message", "Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @com.thanglong.landtax.infrastructure.config.aop.AuditLog(action = "Xóa thửa đất")
    public ResponseEntity<?> deleteParcel(@PathVariable Integer id) {
        landParcelService.deleteParcel(id);
        return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
    }
}
