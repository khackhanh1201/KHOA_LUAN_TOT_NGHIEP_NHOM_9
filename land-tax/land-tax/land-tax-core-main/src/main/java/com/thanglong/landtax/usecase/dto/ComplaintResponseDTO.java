package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponseDTO {
    private Integer id;
    private Integer citizenId;
    private Integer recordId;
    private String content;
    private String status;
    private String responseNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String citizenName;
    private String citizenCccd;
    private String phone;
    private String email;
    private String recordCategory;
    private String complaintTitle;   // parse từ content hoặc set riêng
    private String complaintBody;
    /** TAX_OFFICER | LAND_OFFICER — cán bộ đã yêu cầu bổ sung (NEED_SUPPLEMENT) */
    private String supplementOfficerRole;
    /** Tài liệu đính kèm (Cloudinary URL trong record_documents) */
    private List<DocumentSummaryDTO> attachments;
    /** Thửa đất liên quan (từ hồ sơ hoặc parse nội dung khiếu nại đất) */
    private Integer landParcelId;
    /** Số vào sổ / GCN của thửa đất liên quan */
    private String gcnBookNumber;
}
