package com.eet.backend.services;

import com.eet.backend.model.ExchangeRate;
import com.eet.backend.repositories.ExchangeRateRepository;
import com.eet.backend.services.fx.RateProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class ExchangeRateService {

    private final ExchangeRateRepository repo;
    private final RateProvider primary;                       // Frankfurter
    private final Optional<RateProvider> freeCurrencyFallback; // FreeCurrencyAPI si está habilitado

    private static final int SCALE = 6;

    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (from.equalsIgnoreCase(to)) return amount;
        BigDecimal r = getRate(from, to, LocalDate.now())
                .map(ExchangeRate::getRate)
                .orElseThrow(() -> new IllegalStateException("No rate " + from + "->" + to));
        return amount.multiply(r);
    }

    public Optional<ExchangeRate> getRate(String from, String to) { return getRate(from, to, LocalDate.now()); }

    public Optional<ExchangeRate> getRate(String from, String to, LocalDate date) {
        String f = from.toUpperCase(Locale.ROOT), t = to.toUpperCase(Locale.ROOT);
        LocalDate d = (date == null) ? LocalDate.now() : date;

        // 1) DB
        var hit = repo.findByFromCurrencyAndToCurrencyAndDate(f, t, d);
        if (hit.isPresent()) return hit;

        // 2) Proveedores
        BigDecimal rate = fetchWithFallback(f, t, d);
        ExchangeRate saved = repo.save(ExchangeRate.builder()
                .fromCurrency(f).toCurrency(t).rate(rate).date(d).build());
        return Optional.of(saved);
    }

    private BigDecimal fetchWithFallback(String from, String to, LocalDate date) {
        try { return primary.rate(from, to, date); }
        catch (Exception e) {
            return freeCurrencyFallback
                    .map(p -> p.rate(from, to, date))
                    .orElseThrow(() -> new IllegalStateException("Fuentes FX caídas: " + e.getMessage(), e));
        }
    }

    public Set<String> getSupportedCurrencies() {
        // Puedes delegar a Frankfurter /currencies si quieres. Aquí fija un set.
        return Set.of("EUR","USD","GBP","JPY","CAD","CHF","MXN","PLN");
    }
}
