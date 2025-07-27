package com.eet.backend.scheduler;

import com.eet.backend.service.CountrySpendingStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CountrySpendingStatsScheduler {

    private final CountrySpendingStatsService statsService;

    // Ejecutar a las 23:30 del último día del mes
    @Scheduled(cron = "0 30 23 28-31 * *")
    public void updateCountryStatsIfEndOfMonth() {
        // Solo ejecuta si HOY es el último día del mes
        var today = java.time.LocalDate.now();
        if (today.getDayOfMonth() == today.lengthOfMonth()) {
            log.info("Updating country spending stats for {}", today);
            statsService.updateCountrySpendingStats();
        } else {
            log.info("Skipped stats update; not end of month: {}", today);
        }
    }
}
