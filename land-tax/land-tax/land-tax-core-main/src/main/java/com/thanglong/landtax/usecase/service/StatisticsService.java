package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.LandParcelJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxDeclarationRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.TaxPaymentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.AccountJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ComplaintJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.ProcessingLogJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordJpaRepository;

import java.time.LocalDateTime;
import java.util.List;
/**
 * Service xu ly thong ke, bao cao Dashboard cho Admin.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class StatisticsService {

    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final LandParcelJpaRepository landParcelJpaRepository;

    private final AccountJpaRepository accountJpaRepository;
    private final ComplaintJpaRepository complaintJpaRepository;
    private final ProcessingLogJpaRepository processingLogJpaRepository;
    private final RecordJpaRepository recordJpaRepository;
    /**
     * Lay cac chi so thong ke tong quan cho Dashboard.
     *
     * @return Map chua cac chi so thong ke
     */
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        int currentYear = LocalDate.now().getYear();
    
        // --- Giữ các key cũ (tương thích) ---
        BigDecimal totalTax = taxPaymentJpaRepository.sumPaidAmountByYear(currentYear);
        stats.put("totalTax", totalTax != null ? totalTax : BigDecimal.ZERO);
        stats.put("currentYear", currentYear);
    
        long pendingDeclarations = taxDeclarationRepository.countByRecordCurrentStatus("PENDING");
        stats.put("pendingDeclarations", pendingDeclarations);
    
        long totalParcels = landParcelJpaRepository.count();
        stats.put("totalParcels", totalParcels);
    
        // --- Key mới khớp UI AdminDashboard ---
        long totalAccounts = accountJpaRepository.count();
        long lockedAccounts = accountJpaRepository.countByAccountStatus("LOCKED");
        long pendingComplaints = complaintJpaRepository.countByStatus("PENDING");
    
        // Hoạt động hệ thống 24h = số log xử lý trong 24h gần nhất
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        long visits24h = processingLogJpaRepository.countByProcessedAtAfter(last24h);
    
        // Hồ sơ kẹt = PENDING + SUBMITTED (tuỳ nghiệp vụ, có thể chỉ dùng PENDING)
        long stuckDossiers = pendingDeclarations;
    
        // Sự cố = khiếu nại chờ + hồ sơ PENDING
        long incidents = pendingComplaints + stuckDossiers;
    
        // Tỷ lệ thành công cho donut chart
        long totalRecords = recordJpaRepository.count();
        long approvedRecords = recordJpaRepository.findByCurrentStatus("APPROVED").size();
        int successRate = totalRecords == 0
            ? 100
            : (int) Math.round(approvedRecords * 100.0 / totalRecords);
    
        stats.put("visits24h", visits24h);
        stats.put("totalAccounts", totalAccounts);
        stats.put("lockedAccounts", lockedAccounts);
        stats.put("stuckDossiers", stuckDossiers);
        stats.put("incidents", incidents);
        stats.put("successRate", successRate);
    
        // Chi tiết cảnh báo cho card bên phải
        stats.put("incidentDetails", List.of(
            Map.of("label", "Hồ sơ chờ xử lý", "count", stuckDossiers, "color", "#f59e0b"),
            Map.of("label", "Khiếu nại chờ giải quyết", "count", pendingComplaints, "color", "#dc2626"),
            Map.of("label", "Tài khoản bị khóa", "count", lockedAccounts, "color", "#ef4444")
        ));
    
        return stats;
    }
}
