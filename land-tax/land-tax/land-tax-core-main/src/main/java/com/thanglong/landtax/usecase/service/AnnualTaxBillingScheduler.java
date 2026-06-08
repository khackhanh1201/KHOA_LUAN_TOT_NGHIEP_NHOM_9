package com.thanglong.landtax.usecase.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Cron 01/04 hang nam: tinh thue va phat hanh hoa don (2 ky 50%).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AnnualTaxBillingScheduler {

    private final AnnualTaxBillingService annualTaxBillingService;

    @Value("${tax.annual-billing.scheduler.enabled:true}")
    private boolean enabled;

    @Scheduled(cron = "${tax.annual-billing.cron:0 0 0 1 4 *}", zone = "${tax.scheduler.zone:Asia/Ho_Chi_Minh}")
    public void runAprilBilling() {
        if (!enabled) {
            log.debug("[ANNUAL-BILLING] Scheduler disabled");
            return;
        }
        int taxYear = LocalDate.now().getYear();
        log.info("[ANNUAL-BILLING] Cron triggered for taxYear={}", taxYear);
        try {
            annualTaxBillingService.runAnnualBilling(taxYear);
        } catch (Exception e) {
            log.error("[ANNUAL-BILLING] Cron failed: {}", e.getMessage(), e);
        }
    }
}
