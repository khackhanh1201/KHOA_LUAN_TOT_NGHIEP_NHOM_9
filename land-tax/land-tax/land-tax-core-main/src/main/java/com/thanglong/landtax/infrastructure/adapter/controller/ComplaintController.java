package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.domain.model.Complaint;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.CitizenLocalEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.LandParcelEntity;
import com.thanglong.landtax.usecase.dto.ComplaintRequestDTO;
import com.thanglong.landtax.usecase.dto.ComplaintResponseDTO;
import com.thanglong.landtax.usecase.util.ComplaintSupplementMeta;
import com.thanglong.landtax.usecase.dto.ComplaintSupplementRequestDTO;
import com.thanglong.landtax.usecase.dto.ComplaintUpdateRequestDTO;
import com.thanglong.landtax.usecase.dto.DocumentSummaryDTO;
import com.thanglong.landtax.usecase.service.ComplaintService;
import com.thanglong.landtax.usecase.service.RecordDocumentService;
import com.thanglong.landtax.infrastructure.adapter.controller.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller cho các API liên quan đến Khiếu nại (Complaints).
 */
@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Slf4j
public class ComplaintController {

    private final ComplaintService complaintService;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final RecordDocumentService recordDocumentService;

    /**
     * Công dân gửi khiếu nại (yêu cầu Auth).
     */
    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ComplaintResponseDTO> submitComplaint(@RequestBody ComplaintRequestDTO request) {
        log.info("POST /api/complaints");
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        CitizenLocalEntity citizen = citizenLocalJpaRepository.findByCccdNumber(cccd)
                .orElseThrow(() -> new ResourceNotFoundException("Công dân không tồn tại với số CCCD này"));

        Complaint complaint = Complaint.builder()
                .citizenId(citizen.getCitizenId())
                .recordId(request.getRecordId())
                .content(request.getContent())
                .build();

        Complaint saved = complaintService.submitComplaint(complaint);
        if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            recordDocumentService.linkComplaintDocuments(
                    saved.getId(), saved.getRecordId(), request.getAttachmentIds());
        }
        return ResponseEntity.ok(mapToResponseDTO(saved));
    }

    /**
     * Công dân xem danh sách khiếu nại của chính mình (đường dẫn /my).
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<ComplaintResponseDTO>> getMyComplaints() {
        log.info("GET /api/complaints/my");
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        CitizenLocalEntity citizen = citizenLocalJpaRepository.findByCccdNumber(cccd)
                .orElseThrow(() -> new ResourceNotFoundException("Công dân không tồn tại với số CCCD này"));

        List<ComplaintResponseDTO> myComplaints = complaintService.getComplaintsByCitizen(citizen.getCitizenId()).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(myComplaints);
    }

    /**
     * Công dân xem danh sách khiếu nại của chính mình (đường dẫn /me).
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<ComplaintResponseDTO>> getMyComplaintsMe() {
        log.info("GET /api/complaints/me");
        return getMyComplaints();
    }

    /**
     * Cán bộ xem toàn bộ hoặc lọc theo loại khiếu nại.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER', 'LAND_OFFICER')")
    public ResponseEntity<List<ComplaintResponseDTO>> getComplaints(
            @RequestParam(required = false) String type) {
        log.info("GET /api/complaints - type={}", type);
        List<ComplaintResponseDTO> complaints = complaintService.getComplaintsWithRoleFilter(type).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(complaints);
    }

    /**
     * Danh sách tài liệu đính kèm khiếu nại.
     */
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER', 'LAND_OFFICER', 'CITIZEN')")
    public ResponseEntity<List<DocumentSummaryDTO>> getComplaintDocuments(@PathVariable Integer id) {
        log.info("GET /api/complaints/{}/documents", id);
        Complaint complaint = complaintService.getComplaintById(id);
        return ResponseEntity.ok(recordDocumentService.toSummaries(
                recordDocumentService.findComplaintDocuments(complaint.getId(), complaint.getRecordId())));
    }

    /**
     * Cập nhật khiếu nại (Admin, Tax Officer, Land Officer).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TAX_OFFICER', 'LAND_OFFICER')")
    public ResponseEntity<ComplaintResponseDTO> updateComplaint(
            @PathVariable Integer id,
            @RequestBody ComplaintUpdateRequestDTO request) {
        log.info("PUT /api/complaints/{} - status={}, responseNote={}", id, request.getStatus(), request.getResponseNote());
        Complaint updated = complaintService.updateComplaint(id, request.getStatus(), request.getResponseNote());
        return ResponseEntity.ok(mapToResponseDTO(updated));
    }

    /**
     * Công dân gửi bổ sung khiếu nại sau yêu cầu của cán bộ.
     */
    @PostMapping("/{id}/supplement")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ComplaintResponseDTO> submitSupplement(
            @PathVariable Integer id,
            @RequestBody ComplaintSupplementRequestDTO request) {
        log.info("POST /api/complaints/{}/supplement", id);
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        CitizenLocalEntity citizen = citizenLocalJpaRepository.findByCccdNumber(cccd)
                .orElseThrow(() -> new ResourceNotFoundException("Công dân không tồn tại với số CCCD này"));

        String note = request != null ? request.getAdditionalNote() : null;
        Complaint saved = complaintService.submitSupplement(id, note, citizen.getCitizenId());
        if (request != null && request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
            recordDocumentService.linkComplaintDocuments(
                    saved.getId(), saved.getRecordId(), request.getAttachmentIds());
        }
        return ResponseEntity.ok(mapToResponseDTO(saved));
    }

    private ComplaintResponseDTO mapToResponseDTO(Complaint complaint) {
        if (complaint == null) return null;
    
        CitizenLocalEntity citizen = null;
        if (complaint.getCitizenId() != null) {
            citizen = citizenLocalJpaRepository.findById(complaint.getCitizenId()).orElse(null);
        }

        String rawContent = complaint.getContent() != null ? complaint.getContent() : "";
        String recordCategory = null;
        Integer landParcelId = null;
        String gcnBookNumber = null;

        if (complaint.getRecordId() != null) {
            var recordOpt = recordJpaRepository.findById(complaint.getRecordId());
            if (recordOpt.isPresent()) {
                var record = recordOpt.get();
                recordCategory = record.getRecordCategory();
                landParcelId = record.getLandParcelId();
            }
        }

        if (landParcelId == null) {
            landParcelId = extractLandParcelIdFromContent(rawContent);
        }

        if (landParcelId != null) {
            gcnBookNumber = landParcelJpaRepository.findById(landParcelId)
                    .map(ComplaintController::pickLandCertificateNumber)
                    .orElse(null);
        }

        String title = null;
        String body = rawContent;
        java.util.regex.Matcher m = java.util.regex.Pattern
            .compile("^\\[(.+?)\\]\\s*-\\s*(.*)$", java.util.regex.Pattern.DOTALL)
            .matcher(rawContent);
        if (m.find()) {
            title = m.group(1).trim();
            body = m.group(2).trim();
        }
    
        var supplementMeta = ComplaintSupplementMeta.parse(complaint.getResponseNote());

        List<DocumentSummaryDTO> attachments = recordDocumentService.toSummaries(
                recordDocumentService.findComplaintDocuments(complaint.getId(), complaint.getRecordId()));

        return ComplaintResponseDTO.builder()
            .id(complaint.getId())
            .citizenId(complaint.getCitizenId())
            .recordId(complaint.getRecordId())
            .content(rawContent)
            .status(complaint.getStatus())
            .responseNote(supplementMeta.note())
            .supplementOfficerRole(supplementMeta.role())
            .createdAt(complaint.getCreatedAt())
            .updatedAt(complaint.getUpdatedAt())
            .citizenName(citizen != null ? citizen.getFullName() : null)
            .citizenCccd(citizen != null ? citizen.getCccdNumber() : null)
            .phone(citizen != null ? citizen.getPhoneNumber() : null)
            .email(citizen != null ? citizen.getEmail() : null)
            .recordCategory(recordCategory)
            .complaintTitle(title)
            .complaintBody(body)
            .attachments(attachments)
            .landParcelId(landParcelId)
            .gcnBookNumber(gcnBookNumber)
            .build();
    }

    private static Integer extractLandParcelIdFromContent(String content) {
        if (content == null || content.isBlank()) {
            return null;
        }
        var matcher = java.util.regex.Pattern
                .compile("Mã thửa TĐ-(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE | java.util.regex.Pattern.UNICODE_CASE)
                .matcher(content);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return null;
    }

    private static String pickLandCertificateNumber(LandParcelEntity parcel) {
        if (parcel.getGcnBookNumber() != null && !parcel.getGcnBookNumber().isBlank()) {
            return parcel.getGcnBookNumber().trim();
        }
        if (parcel.getCertificateNumber() != null && !parcel.getCertificateNumber().isBlank()) {
            return parcel.getCertificateNumber().trim();
        }
        return null;
    }
}
