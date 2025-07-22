package com.eet.backend.service;

import com.eet.backend.dto.DashboardDto;
import com.eet.backend.dto.DashboardSummaryDto;
import com.eet.backend.dto.SummaryDto;
import com.eet.backend.model.*;
import com.eet.backend.repository.BudgetRepository;
import com.eet.backend.repository.RecurringTransactionRepository;
import com.eet.backend.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
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

    private final RecurringTransactionRepository recurringTransactionRepository;


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
        List<Transaction> recent = transactionRepository
                .findAllByUser(user, PageRequest.of(0, 5, Sort.by("date").descending()))
                .getContent();

        return new DashboardDto(balance, currentMonthExpenses, maxSpending, availableBudget, recent);
    }

    public List<Transaction> getAllByUserId(UUID userId) {
        return transactionRepository.findByUserUserId(userId);
    }

    public Optional<Transaction> getById(UUID id) {
        return transactionRepository.findById(id);
    }

    public Transaction save(Transaction transaction) {
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

        BigDecimal balance = BigDecimal.ZERO;
        BigDecimal currentMonthExpenses = BigDecimal.ZERO;
        YearMonth currentMonth = YearMonth.now();

        for (Transaction tx : transactions) {
            BigDecimal amount = tx.getAmount();
            if (tx.getType() == TransactionType.INCOME) {
                balance = balance.add(amount);
            } else if (tx.getType() == TransactionType.EXPENSE) {
                balance = balance.subtract(amount);

                YearMonth txMonth = YearMonth.from(tx.getDate());
                if (txMonth.equals(currentMonth)) {
                    currentMonthExpenses = currentMonthExpenses.add(amount);
                }
            }
        }

        return new SummaryDto(balance, currentMonthExpenses);
    }

    public List<Transaction> getRecentByUser(User user, int limit) {
        return transactionRepository
                .findAllByUser(user, PageRequest.of(0, limit, Sort.by("date").descending()))
                .getContent();
    }

    public BigDecimal getBalance(User user) {
        BigDecimal income = transactionRepository.sumAmountByUserAndType(user, TransactionType.INCOME).orElse(BigDecimal.ZERO);
        BigDecimal expenses = transactionRepository.sumAmountByUserAndType(user, TransactionType.EXPENSE).orElse(BigDecimal.ZERO);
        return income.subtract(expenses);
    }

    public BigDecimal getCurrentMonthExpenses(User user) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        return transactionRepository.sumExpensesInDateRange(user, startOfMonth, endOfMonth).orElse(BigDecimal.ZERO);
    }

    public int processDueRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions =
                recurringTransactionRepository.findByActiveTrueAndNextExecutionLessThanEqual(today);

        int count = 0;

        for (RecurringTransaction recurring : dueTransactions) {
            Transaction tx = Transaction.builder()
                    .type(recurring.getType())
                    .amount(recurring.getAmount())
                    .currency(recurring.getCurrency())
                    .date(today)
                    .description(recurring.getDescription())
                    .user(recurring.getUser())
                    .trip(recurring.getTrip())
                    .category(recurring.getCategory())
                    .build();

            transactionRepository.save(tx);

            recurring.setExecutedOccurrences(recurring.getExecutedOccurrences() + 1);
            recurring.setNextExecution(getNextExecutionDate(recurring.getNextExecution(), recurring.getRecurrencePattern()));

            boolean expiredByDate = recurring.getRecurrenceEndDate() != null &&
                    recurring.getNextExecution().isAfter(recurring.getRecurrenceEndDate());

            boolean expiredByCount = recurring.getMaxOccurrences() != null &&
                    recurring.getExecutedOccurrences() >= recurring.getMaxOccurrences();

            if (expiredByDate || expiredByCount) {
                recurring.setActive(false);
            }

            recurringTransactionRepository.save(recurring);
            count++;
        }

        return count;
    }


    private LocalDate getNextExecutionDate(LocalDate current, RecurrencePattern pattern) {
        return switch (pattern) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
    }

}
