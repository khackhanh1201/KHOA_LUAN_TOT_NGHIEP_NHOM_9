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
public class CadastralReportStatsDTO {
    private long totalReceived;
    private long totalResolved;
    private long totalProcessing;
    private long totalOverdue;
    private Double changePercentVsPreviousPeriod;
    private int completionRate;
    private List<CadastralAreaStatDTO> areaStats;
    private List<CadastralDetailItemDTO> details;
    private List<CadastralMonthlyTrendDTO> monthlyTrend;
}
