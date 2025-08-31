package com.eet.backend.services;

import com.eet.backend.dto.ExchangeRateDto;
import com.eet.backend.model.ExchangeRate;
// import com.eet.backend.repository.ExchangeRateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExchangeRateService {

    // private final ExchangeRateRepository exchangeRateRepository;

    // URL y access key desactivadas temporalmente
    // private static final String API_URL = "https://api.exchangeratesapi.io/latest";
    // private static final String accessKey = "f1d140295f63ab70c61484219b256eec";

    // Desactivado: solo si necesitas listar todo

    private static final int SCALE = 6;

    // EUR como divisa base
    private static final Map<String, BigDecimal> EUR_BASE_RATES = Map.ofEntries(
            Map.entry("EUR", BigDecimal.ONE),
            Map.entry("USD", new BigDecimal("1.10")),
            Map.entry("GBP", new BigDecimal("0.85")),
            Map.entry("JPY", new BigDecimal("157.50")),
            Map.entry("CHF", new BigDecimal("0.96")),
            Map.entry("CAD", new BigDecimal("1.47")),
            Map.entry("MXN", new BigDecimal("18.20")),
            Map.entry("PLN", new BigDecimal("4.32"))
    );

    public List<ExchangeRate> getAll() {
        return List.of(); // exchangeRateRepository.findAll();
    }

    public ExchangeRate save(ExchangeRate rate) {
        return rate; // exchangeRateRepository.save(rate);
    }

    public void delete(UUID id) {
        // exchangeRateRepository.deleteById(id);
    }

    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (from.equalsIgnoreCase(to)) return amount;

        ExchangeRate rate = getRate(from, to)
                .orElseThrow(() -> new RuntimeException("Missing hardcoded rate from " + from + " to " + to));
        return rate.convert(amount);
    }

    // Este método está totalmente deshabilitado para evitar uso accidental de la API
    /*
    public ExchangeRate fetchAndStoreRate(String from, String to) {
        RestTemplate restTemplate = new RestTemplate();

        String url = API_URL
                + "?access_key=" + accessKey
                + "&base=" + from.toUpperCase()
                + "&symbols=" + to.toUpperCase();

        Map response = restTemplate.getForObject(url, Map.class);
        if (response == null || !response.containsKey("rates")) {
            throw new RuntimeException("Exchange rate API error: invalid or incomplete response");
        }

        Map<String, Object> rates = (Map<String, Object>) response.get("rates");
        if (!rates.containsKey(to.toUpperCase())) {
            throw new RuntimeException("Exchange rate API error: missing rate for " + to);
        }

        BigDecimal rateValue = new BigDecimal(rates.get(to.toUpperCase()).toString());

        ExchangeRate rate = ExchangeRate.builder()
                .fromCurrency(from.toUpperCase())
                .toCurrency(to.toUpperCase())
                .rate(rateValue)
                .date(LocalDate.now())
                .build();

        return exchangeRateRepository.save(rate);
    }
    */

    public ExchangeRateDto toDto(ExchangeRate rate) {
        return ExchangeRateDto.builder()
                .fromCurrency(rate.getFromCurrency())
                .toCurrency(rate.getToCurrency())
                .rate(rate.getRate())
                .date(rate.getDate())
                .build();
    }

    public Optional<ExchangeRate> getRate(String from, String to, LocalDate date) {
        return getHardcodedRate(from, to);
    }

    public Optional<ExchangeRate> getRate(String from, String to) {
        return getHardcodedRate(from, to);
    }

    public static Set<String> getSupportedCurrencies() {
        return EUR_BASE_RATES.keySet();
    }

    /** Devuelve la tasa hardcodeada entre 'from' y 'to' (si ambas están soportadas). */
    public static Optional<ExchangeRate> getHardcodedRate(String from, String to) {
        if (from == null || to == null) return Optional.empty();
        from = from.toUpperCase(Locale.ROOT);
        to   = to.toUpperCase(Locale.ROOT);

        BigDecimal fromRate = EUR_BASE_RATES.get(from);
        BigDecimal toRate   = EUR_BASE_RATES.get(to);
        if (fromRate == null || toRate == null) return Optional.empty();

        BigDecimal rate = toRate.divide(fromRate, SCALE, RoundingMode.HALF_UP);

        return Optional.of(ExchangeRate.builder()
                .fromCurrency(from)
                .toCurrency(to)
                .rate(rate)
                .date(LocalDate.now())
                .build());
    }

    /** Devuelve TODAS las combinaciones soportadas (8x8 = 64 pares, incl. identidad). */
    public static List<ExchangeRate> getAllHardcodedRates() {
        LocalDate today = LocalDate.now();
        List<String> codes = new ArrayList<>(EUR_BASE_RATES.keySet());

        return codes.stream()
                .flatMap(from -> codes.stream().map(to -> {
                    BigDecimal rate = EUR_BASE_RATES.get(to)
                            .divide(EUR_BASE_RATES.get(from), SCALE, RoundingMode.HALF_UP);
                    return ExchangeRate.builder()
                            .fromCurrency(from)
                            .toCurrency(to)
                            .rate(rate)
                            .date(today)
                            .build();
                }))
                .toList();
    }
}
