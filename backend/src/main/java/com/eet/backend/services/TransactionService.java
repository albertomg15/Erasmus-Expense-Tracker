package com.eet.backend.services;

import com.eet.backend.dto.DashboardDto;
import com.eet.backend.dto.DashboardSummaryDto;
import com.eet.backend.dto.SummaryDto;
import com.eet.backend.dto.TransactionDto;
import com.eet.backend.model.*;
import com.eet.backend.repositories.BudgetRepository;
import com.eet.backend.repositories.RecurringTransactionRepository;
import com.eet.backend.repositories.TransactionRepository;
import com.eet.backend.repositories.TripRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;

    private final BudgetRepository budgetRepository;

    private final TripRepository tripRepository;

    private final ExchangeRateService exchangeRateService;

    public DashboardDto getDashboard(User user) {
        List<Transaction> transactions = transactionRepository.findByUser(user);
        BigDecimal balance = BigDecimal.ZERO;
        BigDecimal currentMonthExpenses = BigDecimal.ZERO;
        YearMonth currentMonth = YearMonth.now();

        for (Transaction tx : transactions) {
            BigDecimal amount = tx.getAmount();
            if (tx.getType() == TransactionType.INCOME) {
                balance = balance.add(amount);
            } else if (tx.getType() == TransactionType.EXPENSE) {
                balance = balance.subtract(amount);

                if (YearMonth.from(tx.getDate()).equals(currentMonth)) {
                    currentMonthExpenses = currentMonthExpenses.add(amount);
                }
            }
        }

        // Obtener el presupuesto del mes actual
        Budget budget = budgetRepository
                .findByUserAndMonthAndYear(user, currentMonth.getMonthValue(), currentMonth.getYear())
                .orElse(null);

        BigDecimal maxSpending = (budget != null) ? budget.getMaxSpending() : null;
        BigDecimal availableBudget = (maxSpending != null) ? maxSpending.subtract(currentMonthExpenses) : null;

        // Obtener transacciones recientes
        List<TransactionDto> recentDtos = transactionRepository
                .findAllByUser(user, PageRequest.of(0, 5, Sort.by("date").descending()))
                .getContent()
                .stream()
                .map(tx -> TransactionDto.builder()
                        .transactionId(tx.getTransactionId())
                        .type(tx.getType().name())
                        .amount(tx.getAmount())
                        .currency(tx.getCurrency())
                        .convertedAmount(exchangeRateService.convert(tx.getAmount(), tx.getCurrency(), user.getPreferredCurrency()))
                        .convertedCurrency(user.getPreferredCurrency())
                        .categoryName(tx.getCategory().getName())
                        .categoryEmoji(tx.getCategory().getEmoji())
                        .date(tx.getDate())
                        .description(tx.getDescription())
                        .tripId(tx.getTrip() != null ? tx.getTrip().getTripId() : null)
                        .build())
                .toList();


        return new DashboardDto(balance, currentMonthExpenses, maxSpending, availableBudget, recentDtos);
    }

    public List<Transaction> getAllByUserId(UUID userId) {
        return transactionRepository.findByUserUserId(userId);
    }

    public Optional<Transaction> getById(UUID id) {
        return transactionRepository.findById(id);
    }

    public Transaction save(Transaction transaction) {

        if (transaction.getTrip() != null && transaction.getTrip().getTripId() != null) {
            UUID tripId = transaction.getTrip().getTripId();
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));
            transaction.setTrip(trip); // asigna la entidad real
        }

        return transactionRepository.save(transaction);
    }

    public void delete(UUID id) {
        transactionRepository.deleteById(id);
    }

    public DashboardSummaryDto getDashboardSummary(UUID userId) {
        List<Transaction> allTransactions = transactionRepository.findByUserUserId(userId);

        BigDecimal income = allTransactions.stream()
                .filter(t -> "income".equalsIgnoreCase(String.valueOf(t.getType())))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expenses = allTransactions.stream()
                .filter(t -> "expense".equalsIgnoreCase(String.valueOf(t.getType())))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalBalance = income.subtract(expenses);

        YearMonth now = YearMonth.now();
        BigDecimal currentMonthExpenses = allTransactions.stream()
                .filter(t -> "expense".equalsIgnoreCase(String.valueOf(t.getType())))
                .filter(t -> {
                    LocalDate date = t.getDate();
                    return date.getYear() == now.getYear() && date.getMonth() == now.getMonth();
                })
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Transaction> recentTransactions = allTransactions.stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .limit(5)
                .toList();

        return new DashboardSummaryDto(totalBalance, currentMonthExpenses, recentTransactions);
    }

    public SummaryDto getSummary(User user) {
        List<Transaction> transactions = transactionRepository.findByUser(user);


        YearMonth currentMonth = YearMonth.now();

        BigDecimal balance = BigDecimal.ZERO;
        BigDecimal monthlyExpenses = BigDecimal.ZERO;

        for (Transaction tx : transactions) {
            BigDecimal converted = exchangeRateService.convert(tx.getAmount(), tx.getCurrency(), user.getPreferredCurrency());

            if (tx.getType() == TransactionType.INCOME) {
                balance = balance.add(converted);
            } else {
                balance = balance.subtract(converted);

                if (YearMonth.from(tx.getDate()).equals(currentMonth)) {
                    monthlyExpenses = monthlyExpenses.add(converted);
                }
            }
        }
        return new SummaryDto(balance, monthlyExpenses, user.getPreferredCurrency());
    }

    public List<Transaction> getRecentByUser(User user, int limit) {
        return transactionRepository
                .findAllByUser(user, PageRequest.of(0, limit, Sort.by("date").descending()))
                .getContent();
    }

    public BigDecimal getBalance(User user) {
        List<Transaction> transactions = transactionRepository.findByUser(user);

        return transactions.stream()
                .map(tx -> {
                    BigDecimal converted = exchangeRateService.convert(
                            tx.getAmount(),
                            tx.getCurrency(),
                            user.getPreferredCurrency()
                    );
                    return tx.getType() == TransactionType.INCOME ? converted : converted.negate();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }


    public BigDecimal getCurrentMonthExpenses(User user) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        List<Transaction> expenses = transactionRepository.findByUserAndTypeAndDateBetween(
                user,
                TransactionType.EXPENSE,
                startOfMonth,
                endOfMonth
        );

        return expenses.stream()
                .map(tx -> exchangeRateService.convert(
                        tx.getAmount(),
                        tx.getCurrency(),
                        user.getPreferredCurrency()
                ))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }





    // TransactionService
    public int processDueRecurringTransactions() {
        throw new UnsupportedOperationException("Use RecurringTransactionService.processDueTransactions()");
    }




    private LocalDate getNextExecutionDate(LocalDate current, RecurrencePattern pattern) {
        return switch (pattern) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
    }

    public Optional<Transaction> update(UUID id, Transaction updated, User user) {
        return transactionRepository.findById(id)
                .filter(tx -> tx.getUser().getUserId().equals(user.getUserId()))
                .map(existing -> {
                    existing.setAmount(updated.getAmount());
                    existing.setCurrency(updated.getCurrency());
                    existing.setDate(updated.getDate());
                    existing.setDescription(updated.getDescription());
                    existing.setType(updated.getType());
                    existing.setCategory(updated.getCategory());
                    if (updated.getTrip() != null && updated.getTrip().getTripId() != null) {
                        UUID tripId = updated.getTrip().getTripId();
                        Trip trip = tripRepository.findById(tripId)
                                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));
                        existing.setTrip(trip);
                    } else {
                        existing.setTrip(null); // por si se quiere desvincular de un viaje
                    }

                    return transactionRepository.save(existing);
                });
    }

    public List<Transaction> getByTripId(UUID tripId) {
        return transactionRepository.findByTrip_TripId(tripId);
    }

}
