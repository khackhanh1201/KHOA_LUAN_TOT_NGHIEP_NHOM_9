package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.usecase.service.AnnualTaxBillingService;
import com.thanglong.landtax.usecase.service.TaxDebtReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * API thu cong cho cron thue dat hang nam (demo / dev).
 */
@RestController
@RequestMapping("/api/admin/annual-tax")
@RequiredArgsConstructor
@Slf4j
public class AnnualTaxAdminController {

    private final AnnualTaxBillingService annualTaxBillingService;
    private final TaxDebtReminderService taxDebtReminderService;

    @PostMapping("/billing/run")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<Map<String, Object>> runBilling(
            @RequestParam(required = false) Integer taxYear) {
        int year = taxYear != null ? taxYear : LocalDate.now().getYear();
        log.info("POST /api/admin/annual-tax/billing/run taxYear={}", year);
        return ResponseEntity.ok(annualTaxBillingService.runAnnualBilling(year));
    }

    @PostMapping("/debt-reminder/run")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_TAX_OFFICER')")
    public ResponseEntity<Map<String, Object>> runDebtReminder(
            @RequestParam(required = false) Integer taxYear) {
        int year = taxYear != null ? taxYear : LocalDate.now().getYear();
        log.info("POST /api/admin/annual-tax/debt-reminder/run taxYear={}", year);
        return ResponseEntity.ok(taxDebtReminderService.runDebtReminder(year));
    }
}
