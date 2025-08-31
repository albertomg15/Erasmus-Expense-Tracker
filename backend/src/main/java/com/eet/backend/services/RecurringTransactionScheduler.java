package com.eet.backend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionScheduler {

    private final RecurringTransactionService recurringTransactionService;

    // Ejecutar cada día a las 03:00 AM
    @Scheduled(cron = "0 0 3 * * *")
    public void runScheduledRecurringTransactions() {
        log.info("Running scheduled recurring transaction processing...");
        recurringTransactionService.processDueTransactions();
    }
}
