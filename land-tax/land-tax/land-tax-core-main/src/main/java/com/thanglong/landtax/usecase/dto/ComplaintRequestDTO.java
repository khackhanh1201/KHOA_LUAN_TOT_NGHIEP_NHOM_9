package com.thanglong.landtax.usecase.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintRequestDTO {
    private Integer recordId;

    @NotBlank(message = "Nội dung khiếu nại không được để trống")
    private String content;

    /** ID tài liệu đã upload qua POST /api/files/upload */
    private List<Long> attachmentIds;
}
