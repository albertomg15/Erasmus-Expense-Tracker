package com.eet.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateInitializer {

    /*private final ExchangeRateService exchangeRateService;

    // Puedes mover esto a application.properties y leer con @Value si prefieres
    private static final List<String> SUPPORTED_CURRENCIES = List.of("EUR", "USD", "GBP", "JPY", "CHF", "CAD", "MXN", "PLN");

    /**
     * Asegura que estén precargadas las tasas desde la moneda base indicada hacia todas las demás

    public void ensureRatesFrom(String baseCurrency) {
        for (String targetCurrency : SUPPORTED_CURRENCIES) {
            if (!targetCurrency.equalsIgnoreCase(baseCurrency)) {
                boolean exists = exchangeRateService
                        .getRate(baseCurrency, targetCurrency, LocalDate.now())
                        .isPresent();

                if (!exists) {
                    try {
                        exchangeRateService.fetchAndStoreRate(baseCurrency, targetCurrency);
                        log.info("Fetched rate {} → {}", baseCurrency, targetCurrency);
                    } catch (Exception e) {
                        log.warn("Failed to fetch rate {} → {}: {}", baseCurrency, targetCurrency, e.getMessage());
                    }
                }
            }
        }
    }*/
}
