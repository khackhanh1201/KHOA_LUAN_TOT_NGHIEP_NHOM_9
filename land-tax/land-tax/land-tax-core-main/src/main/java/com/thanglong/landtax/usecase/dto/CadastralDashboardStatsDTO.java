package com.thanglong.landtax.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CadastralDashboardStatsDTO {
    private long totalRecords;
    private long verifiedRecords;
    private long processingRecords;
    private long needMoreDocsRecords;
    private long fraudRecords;
    private int verifiedRatePercent;

    /** Việc mới cần xử lý */
    private long newSubmittedRecords;
    private long newPendingComplaints;
    private long fraudAlerts;
    private long newWorkTotal;

    private List<OfficerNotificationDTO> newWorkItems;
    private List<OfficerNotificationDTO> recentVerifiedRecords;
    private List<OfficerNotificationDTO> recentComplaints;
}
