package com.thanglong.landtax.usecase.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Cron 01/10 hang nam: quet cong no va nhac nop ky 2.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TaxDebtReminderScheduler {

    private final TaxDebtReminderService taxDebtReminderService;

    @Value("${tax.debt-reminder.scheduler.enabled:true}")
    private boolean enabled;

    @Scheduled(cron = "${tax.debt-reminder.cron:0 0 0 1 10 *}", zone = "${tax.scheduler.zone:Asia/Ho_Chi_Minh}")
    public void runOctoberReminder() {
        if (!enabled) {
            log.debug("[DEBT-REMINDER] Scheduler disabled");
            return;
        }
        int taxYear = LocalDate.now().getYear();
        log.info("[DEBT-REMINDER] Cron triggered for taxYear={}", taxYear);
        try {
            taxDebtReminderService.runDebtReminder(taxYear);
        } catch (Exception e) {
            log.error("[DEBT-REMINDER] Cron failed: {}", e.getMessage(), e);
        }
    }
}
