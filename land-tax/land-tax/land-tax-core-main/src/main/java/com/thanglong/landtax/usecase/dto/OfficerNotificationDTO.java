package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Thông báo động cho cán bộ (hồ sơ / khiếu nại chờ xử lý từ DB).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerNotificationDTO {
    private String id;
    private String title;
    private String content;
    private String notiType;
    private LocalDateTime createdAt;
    private String linkPath;
}
