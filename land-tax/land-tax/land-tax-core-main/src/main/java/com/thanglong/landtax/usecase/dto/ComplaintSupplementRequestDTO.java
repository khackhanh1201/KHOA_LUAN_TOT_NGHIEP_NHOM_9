package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintSupplementRequestDTO {
    /** Nội dung bổ sung từ công dân */
    private String additionalNote;

    /** ID tài liệu đã upload qua POST /api/files/upload */
    private List<Long> attachmentIds;
}
