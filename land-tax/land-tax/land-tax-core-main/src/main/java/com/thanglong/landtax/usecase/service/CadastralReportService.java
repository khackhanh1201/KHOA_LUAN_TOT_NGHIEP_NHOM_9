package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.ComplaintEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ComplaintJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;
import com.thanglong.landtax.usecase.dto.CadastralAreaStatDTO;
import com.thanglong.landtax.usecase.dto.CadastralDetailItemDTO;
import com.thanglong.landtax.usecase.dto.CadastralMonthlyTrendDTO;
import com.thanglong.landtax.usecase.dto.CadastralReportStatsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CadastralReportService {

    private static final int OVERDUE_DAYS = 15;

    private static final Map<String, String> WARD_LABELS = Map.ofEntries(
            Map.entry("W_THANH_LIET", "Xã Thanh Liệt"),
            Map.entry("W01", "Phường Phố Huế"),
            Map.entry("W02", "Phường Hàng Bài"),
            Map.entry("W03", "Phường Kim Mã"),
            Map.entry("W04", "Phường Đội Cấn"),
            Map.entry("W05", "Phường Dịch Vọng"),
            Map.entry("W06", "Phường Mai Dịch"),
            Map.entry("W07", "Phường Nguyễn Trãi"),
            Map.entry("W08", "Phường Khương Trung"),
            Map.entry("W09", "Phường Tây Mỗ"),
            Map.entry("W10", "Phường Mễ Trì"),
            Map.entry("UNKNOWN", "Chưa xác định khu vực")
    );

    private final RecordJpaRepository recordJpaRepository;
    private final ComplaintJpaRepository complaintJpaRepository;

    public CadastralReportStatsDTO getCadastralStatistics(String period, String area, String reportType) {
        log.info("Cadastral report: period={}, area={}, reportType={}", period, area, reportType);

        String wardCode = resolveWardCode(area);
        boolean excludeTax = "gcn".equalsIgnoreCase(reportType);
        boolean complaintOnly = "complaint".equalsIgnoreCase(reportType);

        DateRange current = resolvePeriodRange(period);
        DateRange previous = resolvePreviousPeriodRange(period);

        long totalReceived;
        long totalResolved;
        long totalProcessing;
        long totalOverdue;
        List<CadastralAreaStatDTO> areaStats;
        List<CadastralDetailItemDTO> details;

        if (complaintOnly) {
            totalReceived = complaintJpaRepository.countComplaintsForCadastralReport(
                    current.from(), current.to(), wardCode);
            totalResolved = complaintJpaRepository.countResolvedComplaintsForCadastralReport(
                    current.from(), current.to(), wardCode);
            totalProcessing = complaintJpaRepository.countPendingComplaintsForCadastralReport(
                    current.from(), current.to(), wardCode);
            totalOverdue = totalProcessing;
            areaStats = mapComplaintAreaStats(
                    complaintJpaRepository.countComplaintStatsByWard(current.from(), current.to(), wardCode));
            details = mapComplaintDetails(
                    complaintJpaRepository.findComplaintsForCadastralDetails(current.from(), current.to(), wardCode));
        } else {
            totalReceived = recordJpaRepository.countRecordsForCadastralReport(
                    current.from(), current.to(), wardCode, excludeTax);
            totalResolved = recordJpaRepository.countResolvedRecordsForCadastralReport(
                    current.from(), current.to(), wardCode, excludeTax);
            totalProcessing = recordJpaRepository.countProcessingRecordsForCadastralReport(
                    current.from(), current.to(), wardCode, excludeTax);
            LocalDateTime overdueDeadline = LocalDateTime.now().minusDays(OVERDUE_DAYS);
            totalOverdue = recordJpaRepository.countOverdueRecordsForCadastralReport(
                    overdueDeadline, wardCode, excludeTax);
            areaStats = mapRecordAreaStats(
                    recordJpaRepository.countRecordStatsByWard(current.from(), current.to(), wardCode, excludeTax));
            details = mapRecordDetails(
                    recordJpaRepository.findRecordsForCadastralDetails(current.from(), current.to(), wardCode, excludeTax));
        }

        Double changePercent = null;
        if (!"all".equalsIgnoreCase(period)) {
            long previousTotal = complaintOnly
                    ? complaintJpaRepository.countComplaintsForCadastralReport(previous.from(), previous.to(), wardCode)
                    : recordJpaRepository.countRecordsForCadastralReport(previous.from(), previous.to(), wardCode, excludeTax);
            if (previousTotal > 0) {
                changePercent = Math.round((totalReceived - previousTotal) * 1000.0 / previousTotal) / 10.0;
            } else if (totalReceived > 0) {
                changePercent = 100.0;
            }
        }

        int completionRate = totalReceived == 0
                ? 0
                : (int) Math.round(totalResolved * 100.0 / totalReceived);

        List<CadastralMonthlyTrendDTO> monthlyTrend = buildMonthlyTrend(
                period, current, wardCode, excludeTax, complaintOnly);

        return CadastralReportStatsDTO.builder()
                .totalReceived(totalReceived)
                .totalResolved(totalResolved)
                .totalProcessing(totalProcessing)
                .totalOverdue(totalOverdue)
                .changePercentVsPreviousPeriod(changePercent)
                .completionRate(completionRate)
                .areaStats(areaStats)
                .details(details)
                .monthlyTrend(monthlyTrend)
                .build();
    }

    private List<CadastralMonthlyTrendDTO> buildMonthlyTrend(
            String period,
            DateRange current,
            String wardCode,
            boolean excludeTax,
            boolean complaintOnly) {
        List<Object[]> rows;
        if ("all".equalsIgnoreCase(period)) {
            int year = LocalDate.now().getYear();
            rows = complaintOnly
                    ? complaintJpaRepository.countComplaintMonthlyTrend(year, wardCode)
                    : recordJpaRepository.countRecordMonthlyTrend(year, wardCode, excludeTax);
        } else {
            rows = complaintOnly
                    ? complaintJpaRepository.countComplaintMonthlyTrendInRange(current.from(), current.to(), wardCode)
                    : recordJpaRepository.countRecordMonthlyTrendInRange(
                            current.from(), current.to(), wardCode, excludeTax);
        }

        long[] receivedByMonth = new long[13];
        long[] resolvedByMonth = new long[13];
        if (rows != null) {
            for (Object[] row : rows) {
                if (row[0] == null) {
                    continue;
                }
                int month = ((Number) row[0]).intValue();
                if (month < 1 || month > 12) {
                    continue;
                }
                receivedByMonth[month] = toLong(row[1]);
                resolvedByMonth[month] = toLong(row[2]);
            }
        }

        List<CadastralMonthlyTrendDTO> trend = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            trend.add(CadastralMonthlyTrendDTO.builder()
                    .month(m)
                    .received(receivedByMonth[m])
                    .resolved(resolvedByMonth[m])
                    .build());
        }
        return trend;
    }

    private List<CadastralDetailItemDTO> mapRecordDetails(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        LocalDateTime overdueDeadline = LocalDateTime.now().minusDays(OVERDUE_DAYS);
        List<CadastralDetailItemDTO> items = new ArrayList<>();
        for (Object[] row : rows) {
            RecordEntity record = (RecordEntity) row[0];
            String ward = row[1] != null ? (String) row[1] : "UNKNOWN";
            boolean overdue = isProcessingStatus(record.getCurrentStatus())
                    && record.getSubmittedAt() != null
                    && record.getSubmittedAt().isBefore(overdueDeadline);
            items.add(CadastralDetailItemDTO.builder()
                    .id(record.getRecordId())
                    .code(String.format("HS-%05d", record.getRecordId()))
                    .itemType("RECORD")
                    .category(record.getRecordCategory())
                    .status(record.getCurrentStatus())
                    .submittedAt(record.getSubmittedAt())
                    .unit(formatWardLabel(ward))
                    .overdue(overdue)
                    .build());
        }
        return items;
    }

    private List<CadastralDetailItemDTO> mapComplaintDetails(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        List<CadastralDetailItemDTO> items = new ArrayList<>();
        for (Object[] row : rows) {
            ComplaintEntity complaint = (ComplaintEntity) row[0];
            String ward = row[1] != null ? (String) row[1] : "UNKNOWN";
            items.add(CadastralDetailItemDTO.builder()
                    .id(complaint.getId())
                    .code(String.format("KN-%06d", complaint.getId()))
                    .itemType("COMPLAINT")
                    .category("Khiếu nại")
                    .status(complaint.getStatus())
                    .submittedAt(complaint.getCreatedAt())
                    .unit(formatWardLabel(ward))
                    .overdue("PENDING".equalsIgnoreCase(complaint.getStatus()))
                    .build());
        }
        return items;
    }

    private boolean isProcessingStatus(String status) {
        if (status == null) {
            return false;
        }
        return List.of("SUBMITTED", "PENDING", "PROCESSING", "NEED_MORE_DOCS").contains(status);
    }

    private String resolveWardCode(String area) {
        if (area == null || area.isBlank() || "all".equalsIgnoreCase(area)) {
            return null;
        }
        return area;
    }

    private List<CadastralAreaStatDTO> mapRecordAreaStats(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        List<CadastralAreaStatDTO> stats = new ArrayList<>();
        for (Object[] row : rows) {
            String ward = row[0] != null ? (String) row[0] : "UNKNOWN";
            long total = toLong(row[1]);
            long resolved = toLong(row[2]);
            long pending = toLong(row[3]);
            stats.add(buildAreaRow(ward, total, resolved, pending));
        }
        return stats;
    }

    private List<CadastralAreaStatDTO> mapComplaintAreaStats(List<Object[]> rows) {
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }
        Map<String, CadastralAreaStatDTO> merged = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String ward = row[0] != null ? (String) row[0] : "UNKNOWN";
            long total = toLong(row[1]);
            long resolved = toLong(row[2]);
            long pending = toLong(row[3]);
            merged.merge(ward, buildAreaRow(ward, total, resolved, pending), (a, b) -> CadastralAreaStatDTO.builder()
                    .unit(a.getUnit())
                    .wardCode(a.getWardCode())
                    .total(a.getTotal() + b.getTotal())
                    .resolved(a.getResolved() + b.getResolved())
                    .pending(a.getPending() + b.getPending())
                    .rate(0)
                    .build());
        }
        List<CadastralAreaStatDTO> result = new ArrayList<>();
        for (CadastralAreaStatDTO row : merged.values()) {
            int rate = row.getTotal() == 0 ? 0 : (int) Math.round(row.getResolved() * 100.0 / row.getTotal());
            row.setRate(rate);
            result.add(row);
        }
        return result;
    }

    private CadastralAreaStatDTO buildAreaRow(String wardCode, long total, long resolved, long pending) {
        int rate = total == 0 ? 0 : (int) Math.round(resolved * 100.0 / total);
        return CadastralAreaStatDTO.builder()
                .wardCode(wardCode)
                .unit(formatWardLabel(wardCode))
                .total(total)
                .resolved(resolved)
                .pending(pending)
                .rate(rate)
                .build();
    }

    private String formatWardLabel(String wardCode) {
        return WARD_LABELS.getOrDefault(wardCode, wardCode.replace('_', ' '));
    }

    private long toLong(Object value) {
        if (value == null) {
            return 0L;
        }
        return ((Number) value).longValue();
    }

    private DateRange resolvePeriodRange(String period) {
        if ("all".equalsIgnoreCase(period)) {
            return new DateRange(null, null);
        }

        LocalDate today = LocalDate.now();
        LocalDate start;
        LocalDate endExclusive = today.plusDays(1);

        if ("thisQuarter".equalsIgnoreCase(period)) {
            int month = today.getMonthValue();
            int quarterStartMonth = ((month - 1) / 3) * 3 + 1;
            start = LocalDate.of(today.getYear(), quarterStartMonth, 1);
        } else if ("thisYear".equalsIgnoreCase(period)) {
            start = today.with(TemporalAdjusters.firstDayOfYear());
        } else {
            start = today.with(TemporalAdjusters.firstDayOfMonth());
        }

        return new DateRange(start.atStartOfDay(), endExclusive.atStartOfDay());
    }

    private DateRange resolvePreviousPeriodRange(String period) {
        if ("all".equalsIgnoreCase(period)) {
            return new DateRange(null, null);
        }

        LocalDate today = LocalDate.now();
        LocalDate start;
        LocalDate end;

        if ("thisQuarter".equalsIgnoreCase(period)) {
            int month = today.getMonthValue();
            int quarterStartMonth = ((month - 1) / 3) * 3 + 1;
            start = LocalDate.of(today.getYear(), quarterStartMonth, 1).minusMonths(3);
            end = LocalDate.of(today.getYear(), quarterStartMonth, 1);
        } else if ("thisYear".equalsIgnoreCase(period)) {
            start = today.with(TemporalAdjusters.firstDayOfYear()).minusYears(1);
            end = today.with(TemporalAdjusters.firstDayOfYear());
        } else {
            start = today.with(TemporalAdjusters.firstDayOfMonth()).minusMonths(1);
            end = today.with(TemporalAdjusters.firstDayOfMonth());
        }

        return new DateRange(start.atStartOfDay(), end.atStartOfDay());
    }

    private record DateRange(LocalDateTime from, LocalDateTime to) {}
}
