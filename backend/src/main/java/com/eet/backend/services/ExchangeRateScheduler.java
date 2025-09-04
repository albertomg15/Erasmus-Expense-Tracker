package com.eet.backend.services;

import com.eet.backend.model.ExchangeRate;
import com.eet.backend.repositories.ExchangeRateRepository;
import com.eet.backend.services.fx.RateProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateScheduler {

    private final ExchangeRateRepository repo;
    private final RateProvider provider; // Frankfurter

    private static final String BASE = "EUR";
    private static final List<String> TARGETS = List.of("USD","GBP","JPY","CAD","CHF","MXN","PLN");

    // El BCE publica ~16:00 CET. Precarga 16:10 Europa/Madrid, lunes-viernes.
    @Scheduled(cron = "0 10 16 * * MON-FRI", zone = "Europe/Madrid")
    public void preloadDaily() {
        LocalDate today = LocalDate.now();
        for (String to : TARGETS) {
            if (to.equals(BASE)) continue;
            if (repo.findByFromCurrencyAndToCurrencyAndDate(BASE, to, today).isPresent()) continue;
            var rate = provider.rate(BASE, to, today);
            repo.save(ExchangeRate.builder().fromCurrency(BASE).toCurrency(to).rate(rate).date(today).build());
            log.info("FX saved {} -> {} {} {}", BASE, to, rate, today);
        }
    }
}
