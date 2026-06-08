package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.domain.model.Complaint;
import com.thanglong.landtax.domain.repository.ComplaintRepository;
import com.thanglong.landtax.domain.service.NotificationService;
import com.thanglong.landtax.usecase.util.ComplaintSupplementMeta;
import com.thanglong.landtax.infrastructure.adapter.controller.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository recordJpaRepository;

    /**
     * Gửi khiếu nại mới (Công dân).
     */
    @Transactional
    public Complaint submitComplaint(Complaint complaint) {
        log.info("Submit new complaint for citizenId={}, recordId={}",
                complaint.getCitizenId(), complaint.getRecordId());

        complaint.setStatus("PENDING");
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        auditLogService.log("SUBMIT_COMPLAINT", "COMPLAINT",
                String.valueOf(saved.getId()),
                "Công dân gửi khiếu nại mới");

        return saved;
    }

    /**
     * Cán bộ phản hồi khiếu nại.
     */
    @Transactional
    public Complaint respondToComplaint(Integer complaintId, String responseNote) {
        log.info("Officer responding to complaintId={}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Khiếu nại không tồn tại"));

        complaint.setResponseNote(responseNote);
        complaint.setStatus("RESOLVED");
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        auditLogService.log("RESPOND_COMPLAINT", "COMPLAINT",
                String.valueOf(complaintId),
                "Cán bộ phản hồi khiếu nại");

        // Gửi thông báo tự động cho người dân
        try {
            String notifyContent = complaint.getRecordId() != null
                    ? "Khiếu nại của bạn về hồ sơ #" + complaint.getRecordId() + " đã được phản hồi: " + responseNote
                    : "Khiếu nại của bạn đã được phản hồi: " + responseNote;

            notificationService.createNotification(
                    complaint.getCitizenId(),
                    "Khiếu nại đã được giải quyết",
                    notifyContent,
                    "COMPLAINT_RESOLVED"
            );
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo giải quyết khiếu nại ID={}: {}", complaintId, e.getMessage());
        }

        return saved;
    }

    /**
     * Lấy danh sách khiếu nại của 1 công dân.
     */
    public List<Complaint> getComplaintsByCitizen(Integer citizenId) {
        log.info("Fetching complaints for citizenId={}", citizenId);
        return complaintRepository.findByCitizenId(citizenId);
    }

    /**
     * Lấy chi tiết khiếu nại theo ID.
     */
    public Complaint getComplaintById(Integer id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khiếu nại không tồn tại"));
    }

    /**
     * Lấy toàn bộ danh sách khiếu nại (Cán bộ) có bộ lọc theo vai trò.
     */
    public List<Complaint> getComplaintsWithRoleFilter(String type) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isTaxOfficer = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_TAX_OFFICER"));
        boolean isLandOfficer = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAND_OFFICER"));

        if (isTaxOfficer) {
            type = "TAX";
        } else if (isLandOfficer) {
            type = "LAND";
        }

        log.info("Fetching complaints with role filter type={}", type);
        return complaintRepository.findByComplaintType(type);
    }

    /**
     * Cập nhật khiếu nại theo phân quyền.
     */
    @Transactional
    public Complaint updateComplaint(Integer id, String status, String responseNote) {
        log.info("Updating complaint id={}, status={}, responseNote={}", id, status, responseNote);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTaxOfficer = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_TAX_OFFICER"));
        boolean isLandOfficer = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAND_OFFICER"));

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khiếu nại không tồn tại"));

        String oldStatus = complaint.getStatus();

        boolean isTaxComplaint = false;
        if (complaint.getRecordId() != null) {
            var recordOpt = recordJpaRepository.findById(complaint.getRecordId());
            if (recordOpt.isPresent()) {
                String cat = recordOpt.get().getRecordCategory();
                isTaxComplaint = "TAX_DECLARATION".equals(cat) || "TAX".equals(cat);
            }
        }

        if (isTaxOfficer) {
            if (!isTaxComplaint) {
                throw new org.springframework.security.access.AccessDeniedException("Cán bộ thuế chỉ được phản hồi khiếu nại về thuế");
            }
        } else if (isLandOfficer) {
            if (isTaxComplaint) {
                throw new org.springframework.security.access.AccessDeniedException("Cán bộ địa chính chỉ được phản hồi khiếu nại về đất");
            }
        } else if (!isAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền cập nhật khiếu nại này");
        }

        if (status != null && !status.isBlank()) {
            String newStatus = status.trim().toUpperCase();
            if (("RESOLVED".equals(newStatus) || "REJECTED".equals(newStatus) || "NEED_SUPPLEMENT".equals(newStatus))
                && (responseNote == null || responseNote.isBlank())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "NEED_SUPPLEMENT".equals(newStatus)
                                ? "Nội dung yêu cầu bổ sung không được để trống"
                                : "Kết luận cuối cùng (phản hồi) không được để trống khi đóng khiếu nại"
                );
            }
            complaint.setStatus(newStatus);
        }

        if (responseNote != null && !responseNote.isBlank()) {
            String trimmed = responseNote.trim();
            if ("NEED_SUPPLEMENT".equals(complaint.getStatus())) {
                String role = isTaxOfficer
                        ? ComplaintSupplementMeta.ROLE_TAX
                        : (isLandOfficer
                                ? ComplaintSupplementMeta.ROLE_LAND
                                : (isTaxComplaint
                                        ? ComplaintSupplementMeta.ROLE_TAX
                                        : ComplaintSupplementMeta.ROLE_LAND));
                complaint.setResponseNote(ComplaintSupplementMeta.prefixRole(role, trimmed));
            } else {
                complaint.setResponseNote(trimmed);
            }
        }

        complaint.setUpdatedAt(LocalDateTime.now());
        Complaint saved = complaintRepository.save(complaint);

        auditLogService.log("UPDATE_COMPLAINT", "COMPLAINT", String.valueOf(id),
                "Cập nhật khiếu nại với status=" + saved.getStatus());

        // Gửi thông báo khi status thay đổi
        boolean statusChanged = !saved.getStatus().equalsIgnoreCase(oldStatus);
        if (statusChanged) {
            try {
                String title;
                String notifyContent;
                String notifyType;

                String currentStatus = saved.getStatus();
                if ("IN_PROGRESS".equals(currentStatus) || "PROCESSING".equals(currentStatus)) {
                    title = "Khiếu nại đang được xử lý";
                    notifyContent = "Khiếu nại của bạn đã được tiếp nhận và đang trong quá trình xử lý.";
                    if (saved.getResponseNote() != null && !saved.getResponseNote().isBlank()) {
                        notifyContent += " Ghi chú của cán bộ: " + saved.getResponseNote();
                    }
                    notifyType = "COMPLAINT_IN_PROGRESS";
                } else if ("RESOLVED".equals(currentStatus)) {
                    title = "Khiếu nại đã được giải quyết";
                    notifyContent = "Khiếu nại của bạn đã được giải quyết thành công. Kết luận: " + saved.getResponseNote();
                    notifyType = "COMPLAINT_RESOLVED";
                } else if ("REJECTED".equals(currentStatus)) {
                    title = "Khiếu nại bị từ chối";
                    notifyContent = "Khiếu nại của bạn đã bị từ chối. Lý do: " + saved.getResponseNote();
                    notifyType = "COMPLAINT_REJECTED";
                } else if ("NEED_SUPPLEMENT".equals(currentStatus)) {
                    title = "Cần bổ sung hồ sơ khiếu nại";
                    notifyContent = "Cán bộ yêu cầu bạn bổ sung hồ sơ/tài liệu cho khiếu nại. Chi tiết: "
                            + saved.getResponseNote();
                    notifyType = "COMPLAINT_NEED_SUPPLEMENT";
                } else {
                    title = "Khiếu nại đã được cập nhật";
                    notifyContent = "Khiếu nại của bạn đã có cập nhật mới. Trạng thái: " + currentStatus;
                    notifyType = "COMPLAINT_UPDATED";
                }

                notificationService.createNotification(
                        saved.getCitizenId(),
                        title,
                        notifyContent,
                        notifyType
                );
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo cập nhật khiếu nại ID={}: {}", id, e.getMessage());
            }
        }

        return saved;
    }

    /**
     * Công dân gửi bổ sung sau khi cán bộ yêu cầu (status NEED_SUPPLEMENT).
     */
    @Transactional
    public Complaint submitSupplement(Integer complaintId, String additionalNote, Integer citizenId) {
        if (additionalNote == null || additionalNote.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Nội dung bổ sung không được để trống");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Khiếu nại không tồn tại"));

        if (!complaint.getCitizenId().equals(citizenId)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền bổ sung khiếu nại này");
        }

        if (!"NEED_SUPPLEMENT".equalsIgnoreCase(complaint.getStatus())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Khiếu nại hiện không ở trạng thái chờ bổ sung");
        }

        String stamp = java.time.LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        String existing = complaint.getContent() != null ? complaint.getContent() : "";
        complaint.setContent(existing + "\n\n[Bổ sung " + stamp + "]\n" + additionalNote.trim());
        complaint.setStatus("IN_PROGRESS");
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        auditLogService.log("SUPPLEMENT_COMPLAINT", "COMPLAINT", String.valueOf(complaintId),
                "Công dân đã bổ sung nội dung khiếu nại");

        try {
            notificationService.notifyComplaintSupplementSubmitted(citizenId, complaintId);
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo bổ sung khiếu nại ID={}: {}", complaintId, e.getMessage());
        }

        return saved;
    }
}
