package com.eet.backend.service;

import com.eet.backend.dto.CountryComparisonDto;
import com.eet.backend.dto.CountryComparisonResponse;
import com.eet.backend.model.CountrySpendingStats;
import com.eet.backend.model.Transaction;
import com.eet.backend.model.TransactionType;
import com.eet.backend.model.User;
import com.eet.backend.repository.CountrySpendingStatsRepository;
import com.eet.backend.repository.TransactionRepository;
import com.eet.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CountrySpendingStatsService {

    private final CountrySpendingStatsRepository statsRepo;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;

    private static final Map<String, String> COUNTRY_CURRENCY_MAP = Map.ofEntries(
            Map.entry("ES", "EUR"),
            Map.entry("FR", "EUR"),
            Map.entry("IT", "EUR"),
            Map.entry("DE", "EUR"),
            Map.entry("PT", "EUR"),
            Map.entry("IE", "EUR"),
            Map.entry("NL", "EUR"),
            Map.entry("AT", "EUR"),
            Map.entry("FI", "EUR"),
            Map.entry("GR", "EUR"),
            Map.entry("BE", "EUR"),
            Map.entry("LU", "EUR"),
            Map.entry("CY", "EUR"),
            Map.entry("SK", "EUR"),
            Map.entry("SI", "EUR"),
            Map.entry("LT", "EUR"),
            Map.entry("LV", "EUR"),
            Map.entry("EE", "EUR"),
            Map.entry("PL", "PLN"),
            Map.entry("CH", "CHF"),
            Map.entry("JP", "JPY"),
            Map.entry("GB", "GBP"),
            Map.entry("US", "USD"),
            Map.entry("CA", "CAD"),
            Map.entry("MX", "MXN")
    );


    public void addUserAverage(String country, String category, BigDecimal userAvg) {
        statsRepo.findByCountryAndCategory(country, category).ifPresentOrElse(
                existing -> {
                    int newSampleSize = existing.getSampleSize() + 1;
                    BigDecimal newAvg = existing.getAverageAmount()
                            .multiply(BigDecimal.valueOf(existing.getSampleSize()))
                            .add(userAvg)
                            .divide(BigDecimal.valueOf(newSampleSize), 2, RoundingMode.HALF_UP);

                    existing.setAverageAmount(newAvg);
                    existing.setSampleSize(newSampleSize);
                    statsRepo.save(existing);
                },
                () -> {
                    CountrySpendingStats stat = new CountrySpendingStats();
                    stat.setCountry(country);
                    stat.setCategory(category);
                    stat.setAverageAmount(userAvg.setScale(2, RoundingMode.HALF_UP));
                    stat.setSampleSize(1);
                    statsRepo.save(stat);
                }
        );
    }

    public void updateCountrySpendingStats() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();

        List<User> users = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getConsentToDataAnalysis()))
                .filter(u -> u.getCountry() != null && COUNTRY_CURRENCY_MAP.containsKey(u.getCountry()))
                .toList();

        for (User user : users) {
            String country = user.getCountry();
            String countryCurrency = COUNTRY_CURRENCY_MAP.get(country);

            List<Transaction> userTxs = transactionRepository.findByUserAndTypeAndDateBetween(
                            user,
                            TransactionType.EXPENSE,
                            start,
                            end
                    ).stream()
                    .filter(tx -> tx.getCategory() != null && tx.getCategory().isDefault())
                    .filter(tx -> tx.getTrip() == null) // excluimos transacciones asociadas a viajes
                    .collect(Collectors.toList());

            if (userTxs.size() < 3) continue; // umbral mínimo de datos

            Map<String, List<Transaction>> byCategory = userTxs.stream()
                    .collect(Collectors.groupingBy(tx -> tx.getCategory().getName()));

            for (Map.Entry<String, List<Transaction>> entry : byCategory.entrySet()) {
                String category = entry.getKey();
                List<Transaction> txsInCategory = entry.getValue();

                // conversión a la moneda del país
                BigDecimal totalConverted = txsInCategory.stream()
                        .map(tx -> exchangeRateService.convert(tx.getAmount(), tx.getCurrency(), countryCurrency))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal userAverage = totalConverted.divide(BigDecimal.valueOf(txsInCategory.size()), 2, RoundingMode.HALF_UP);

                // actualizar estadísticas del país
                addUserAverage(country, category, userAverage);
            }
        }
    }

    public CountryComparisonResponse getComparisonForUser(User user, boolean forceIncludeIncomplete) {
        String country = user.getCountry();
        String currency = COUNTRY_CURRENCY_MAP.get(country);

        if (country == null || currency == null) return new CountryComparisonResponse(true, List.of());

        YearMonth now = YearMonth.now();
        LocalDate start = now.atDay(1);
        LocalDate end = now.atEndOfMonth();

        List<Transaction> txs = transactionRepository.findByUserAndTypeAndDateBetween(
                        user, TransactionType.EXPENSE, start, end
                ).stream()
                .filter(tx -> tx.getCategory() != null && tx.getCategory().isDefault())
                .filter(tx -> tx.getTrip() == null)
                .collect(Collectors.toList());

        boolean incomplete = txs.size() < 3;

        Map<String, BigDecimal> userAvgByCategory = txs.stream()
                .collect(Collectors.groupingBy(
                        tx -> tx.getCategory().getName(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                txsInCat -> txsInCat.stream()
                                        .map(tx -> exchangeRateService.convert(tx.getAmount(), tx.getCurrency(), currency))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .divide(BigDecimal.valueOf(txsInCat.size()), 2, RoundingMode.HALF_UP)
                        )
                ));

        // para todas las categorías del país, aunque el usuario no tenga datos
        List<CountryComparisonDto> comparisons = statsRepo.findByCountry(country).stream()
                .map(stat -> {
                    BigDecimal userAvg = userAvgByCategory.get(stat.getCategory());
                    return new CountryComparisonDto(
                            stat.getCategory(),
                            (incomplete && !forceIncludeIncomplete) ? null : userAvg,
                            stat.getAverageAmount(),
                            currency
                    );
                })
                .toList();

        return new CountryComparisonResponse(incomplete, comparisons);
    }




}
