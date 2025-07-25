package com.eet.backend.service;

import com.eet.backend.dto.stats.*;
import com.eet.backend.model.*;
import com.eet.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StatsService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    public MonthlySummaryDto getMonthlySummary(UUID userId, Integer month, Integer year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        YearMonth target = (month != null && year != null)
                ? YearMonth.of(year, month)
                : YearMonth.now();

        LocalDate start = target.atDay(1);
        LocalDate end = target.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, start, end);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> expensesByCategory = new HashMap<>();

        for (Transaction tx : transactions) {
            BigDecimal amount = tx.getAmount();
            if (tx.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(amount);
            } else if (tx.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(amount);
                String key = tx.getCategory().getEmoji() != null
                        ? tx.getCategory().getEmoji() + " " + tx.getCategory().getName()
                        : tx.getCategory().getName();
                expensesByCategory.merge(key, amount, BigDecimal::add);
            }
        }

        // presupuesto del mes
        Optional<Budget> optionalBudget =
                budgetRepository.findByUserAndMonthAndYear(user, target.getMonthValue(), target.getYear());
        BigDecimal monthlyBudget = optionalBudget.map(Budget::getMaxSpending).orElse(null);
        BigDecimal percentUsed = (monthlyBudget != null && monthlyBudget.compareTo(BigDecimal.ZERO) > 0)
                ? totalExpense.multiply(BigDecimal.valueOf(100))
                .divide(monthlyBudget, 2, BigDecimal.ROUND_HALF_UP)
                : null;

        return MonthlySummaryDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(totalIncome.subtract(totalExpense))
                .monthlyBudget(monthlyBudget)
                .budgetUsedPercent(percentUsed)
                .expensesByCategory(expensesByCategory)
                .build();
    }


    public List<MonthlyEvolutionEntryDto> getMonthlyEvolution(UUID userId, int monthsBack) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.minusMonths(monthsBack - 1).withDayOfMonth(1);

        List<Transaction> transactions = transactionRepository.findByUserAndDateAfter(user, startDate);

        // Map<YearMonth, List<Transaction>>
        Map<YearMonth, List<Transaction>> grouped = transactions.stream()
                .collect(Collectors.groupingBy(tx -> YearMonth.from(tx.getDate())));

        List<MonthlyEvolutionEntryDto> result = new ArrayList<>();

        for (int i = 0; i < monthsBack; i++) {
            YearMonth ym = YearMonth.now().minusMonths(monthsBack - 1 - i);
            List<Transaction> monthTxs = grouped.getOrDefault(ym, List.of());

            BigDecimal income = monthTxs.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expense = monthTxs.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(MonthlyEvolutionEntryDto.builder()
                    .month(ym.toString()) // YYYY-MM
                    .income(income)
                    .expense(expense)
                    .balance(income.subtract(expense))
                    .build());
        }

        return result;
    }

    public IncomeVsExpenseDto getIncomeVsExpense(UUID userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserUserIdAndDateBetween(userId, start, end);

        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction tx : transactions) {
            String categoryName = tx.getCategory() != null ? tx.getCategory().getName() : "Uncategorized";
            BigDecimal amount = tx.getAmount();

            if (tx.getType() == TransactionType.INCOME) {
                incomeByCategory.merge(categoryName, amount, BigDecimal::add);
                totalIncome = totalIncome.add(amount);
            } else if (tx.getType() == TransactionType.EXPENSE) {
                expenseByCategory.merge(categoryName, amount, BigDecimal::add);
                totalExpense = totalExpense.add(amount);
            }
        }

        return IncomeVsExpenseDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .incomeByCategory(incomeByCategory)
                .expenseByCategory(expenseByCategory)
                .build();
    }

    public List<MonthlyComparisonDto> getMonthlyComparison(UUID userId, int monthsBack) {
        LocalDate now = LocalDate.now();
        List<MonthlyComparisonDto> results = new ArrayList<>();

        for (int i = 0; i < monthsBack; i++) {
            LocalDate target = now.minusMonths(i);
            int month = target.getMonthValue();
            int year = target.getYear();
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

            List<Transaction> transactions = transactionRepository
                    .findByUserUserIdAndDateBetween(userId, start, end);

            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            Map<String, BigDecimal> incomeByCategory = new HashMap<>();
            Map<String, BigDecimal> expenseByCategory = new HashMap<>();

            for (Transaction tx : transactions) {
                String category = tx.getCategory() != null ? tx.getCategory().getName() : "Uncategorized";
                BigDecimal amount = tx.getAmount();

                if (tx.getType() == TransactionType.INCOME) {
                    totalIncome = totalIncome.add(amount);
                    incomeByCategory.merge(category, amount, BigDecimal::add);
                } else if (tx.getType() == TransactionType.EXPENSE) {
                    totalExpense = totalExpense.add(amount);
                    expenseByCategory.merge(category, amount, BigDecimal::add);
                }
            }

            results.add(MonthlyComparisonDto.builder()
                    .month(month)
                    .year(year)
                    .totalIncome(totalIncome)
                    .totalExpense(totalExpense)
                    .incomeByCategory(incomeByCategory)
                    .expenseByCategory(expenseByCategory)
                    .build());
        }

        // Orden ascendente por fecha
        results.sort(Comparator.comparing((MonthlyComparisonDto dto) -> dto.getYear() * 100 + dto.getMonth()));
        return results;
    }

    public List<TripSpendingDto> getTripSpending(UUID userId) {
        List<Trip> trips = tripRepository.findByUserUserId(userId);
        List<TripSpendingDto> result = new ArrayList<>();

        for (Trip trip : trips) {
            List<Transaction> txs = transactionRepository.findByTrip_TripId(trip.getTripId());

            BigDecimal total = BigDecimal.ZERO;
            Map<String, BigDecimal> byCategory = new HashMap<>();

            for (Transaction tx : txs) {
                if (tx.getType() == TransactionType.EXPENSE) {
                    BigDecimal amount = tx.getAmount();
                    total = total.add(amount);
                    String category = tx.getCategory() != null ? tx.getCategory().getName() : "Uncategorized";
                    byCategory.merge(category, amount, BigDecimal::add);
                }
            }

            result.add(TripSpendingDto.builder()
                    .tripId(trip.getTripId())
                    .name(trip.getName())
                    .startDate(trip.getStartDate())
                    .endDate(trip.getEndDate())
                    .currency(txs.stream().findFirst().map(Transaction::getCurrency).orElse("EUR"))
                    .totalSpent(total)
                    .expenseByCategory(byCategory)
                    .build());
        }

        // Ordenar por gasto total descendente
        result.sort((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()));
        return result;
    }

    public AnnualSummaryDto getAnnualSummary(UUID userId, int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<Transaction> txs = transactionRepository.findByUserUserIdAndDateBetween(userId, start, end);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();

        for (Transaction tx : txs) {
            BigDecimal amount = tx.getAmount();
            String category = tx.getCategory() != null ? tx.getCategory().getName() : "Uncategorized";

            if (tx.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(amount);
                incomeByCategory.merge(category, amount, BigDecimal::add);
            } else if (tx.getType() == TransactionType.EXPENSE) {
                totalExpense = totalExpense.add(amount);
                expenseByCategory.merge(category, amount, BigDecimal::add);
            }
        }

        return AnnualSummaryDto.builder()
                .year(year)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .totalSaving(totalIncome.subtract(totalExpense))
                .incomeByCategory(incomeByCategory)
                .expenseByCategory(expenseByCategory)
                .build();
    }

    public List<TripSpendingDto> getTripSpendingByUser(UUID userId) {
        List<Trip> trips = tripRepository.findByUserUserId(userId);

        return trips.stream().map(trip -> {
            List<Transaction> expenses = transactionRepository.findByUserIdAndTrip_TripIdAndType(
                    userId, trip.getTripId(), TransactionType.EXPENSE);

            BigDecimal totalSpent = expenses.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, BigDecimal> expenseByCategory = expenses.stream()
                    .collect(Collectors.groupingBy(
                            tx -> tx.getCategory().getName(),
                            Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                    ));

            return TripSpendingDto.builder()
                    .tripId(trip.getTripId())
                    .name(trip.getName())
                    .startDate(trip.getStartDate())
                    .endDate(trip.getEndDate())
                    .currency(trip.getCurrency())
                    .totalSpent(totalSpent)
                    .expenseByCategory(expenseByCategory)
                    .build();
        }).collect(Collectors.toList());
    }

}
