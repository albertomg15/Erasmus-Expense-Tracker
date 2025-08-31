package com.eet.backend.services;

import com.eet.backend.model.ExchangeRate;
import com.eet.backend.repositories.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateScheduler {

    private final ExchangeRateRepository exchangeRateRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String BASE_CURRENCY = "EUR";
    private static final String[] TARGET_CURRENCIES = {"USD", "GBP", "JPY", "CAD", "CHF", "MXN"}; // amplía si quieres
    private static final String API_URL = "https://api.exchangerate.host/latest?base=" + BASE_CURRENCY;

    @Scheduled(cron = "0 0 3 * * *") // Cada día a las 03:00
    public void updateExchangeRatesDaily() {
        try {
            log.info("Updating exchange rates...");

            Map<String, Object> response = restTemplate.getForObject(API_URL, Map.class);
            if (response == null || !response.containsKey("rates")) {
                log.warn("Empty or invalid exchange rate response");
                return;
            }

            Map<String, Object> rates = (Map<String, Object>) response.get("rates");
            LocalDate today = LocalDate.now();

            for (String target : TARGET_CURRENCIES) {
                if (target.equalsIgnoreCase(BASE_CURRENCY)) continue;

                BigDecimal rateValue = new BigDecimal(rates.get(target).toString());

                boolean exists = exchangeRateRepository
                        .findByFromCurrencyAndToCurrencyAndDate(BASE_CURRENCY, target, today)
                        .isPresent();

                if (!exists) {
                    ExchangeRate rate = ExchangeRate.builder()
                            .fromCurrency(BASE_CURRENCY)
                            .toCurrency(target)
                            .rate(rateValue)
                            .date(today)
                            .build();
                    exchangeRateRepository.save(rate);
                    log.info("Saved rate {} -> {} = {}", BASE_CURRENCY, target, rateValue);
                }
            }

        } catch (Exception e) {
            log.error("Failed to update exchange rates", e);
        }
    }
}
