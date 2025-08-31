package com.eet.backend.controllers;

import com.eet.backend.dto.*;
import com.eet.backend.model.*;
import com.eet.backend.services.*;
//import com.eet.backend.service.ExchangeRateInitializer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final BudgetService budgetService;
    private final ExchangeRateService exchangeRateService;
    private final RecurringTransactionService recurringTransactionService;

    // private final ExchangeRateInitializer exchangeRateInitializer;

    // ==================== UTIL ====================
    private User getAuthenticatedUser(UserDetails userDetails) {
        return userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // ==================== CRUD ====================
    @GetMapping
    public ResponseEntity<List<TransactionDto>> getAllTransactions(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        recurringTransactionService.processDueTransactionsForUser(user); // <-- NUEVO

        List<Transaction> transactions = transactionService.getAllByUserId(user.getUserId());

        List<TransactionDto> dtos = transactions.stream()
                .map(tx -> toDto(tx, user))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDto> getTransactionById(@PathVariable UUID id,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);

        return transactionService.getById(id)
                .map(tx -> ResponseEntity.ok(toDto(tx, user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody TransactionRequestDto dto,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Transaction transaction = toEntity(dto, user);
        Transaction saved = transactionService.save(transaction);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable UUID id,
                                                         @RequestBody TransactionRequestDto dto,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Transaction base = toEntity(dto, user);

        return transactionService.update(id, base, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== RESÚMENES ====================
    @GetMapping("/summary")
    public ResponseEntity<SummaryDto> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(transactionService.getSummary(user));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TransactionDto>> getRecentTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5") int limit) {

        User user = getAuthenticatedUser(userDetails);
        List<TransactionDto> dtos = transactionService.getRecentByUser(user, limit).stream()
                .map(tx -> toDto(tx, user))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboardData(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);

        BigDecimal balance = transactionService.getBalance(user);
        BigDecimal currentExpenses = transactionService.getCurrentMonthExpenses(user);
       // exchangeRateInitializer.ensureRatesFrom(user.getPreferredCurrency());


        Optional<Budget> monthlyBudget = budgetService.getMonthlyBudget(
                user.getUserId(),
                LocalDate.now().getMonthValue(),
                LocalDate.now().getYear()
        );

        BigDecimal maxSpending = monthlyBudget.map(Budget::getMaxSpending).orElse(null);
        BigDecimal availableBudget = (maxSpending != null) ? maxSpending.subtract(currentExpenses) : null;

        List<TransactionDto> recentDtos = transactionService.getRecentByUser(user, 5)
                .stream()
                .map(tx -> toDto(tx, user))
                .toList();

        DashboardDto dto = new DashboardDto(
                balance,
                currentExpenses,
                maxSpending,
                availableBudget,
                recentDtos
        );

        return ResponseEntity.ok(dto);
    }



    // ==================== RECURRENTES ====================
    @PostMapping("/process-recurring")
    public ResponseEntity<String> processRecurringTransactionsManually(
            @AuthenticationPrincipal UserDetails userDetails) {
        getAuthenticatedUser(userDetails);
        int processed = recurringTransactionService.processDueTransactions();
        return ResponseEntity.ok("Processed " + processed + " recurring transactions.");
    }

    // ==================== TRIP RELACIONADO ====================
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<TransactionDto>> getByTripId(@PathVariable UUID tripId,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(
                transactionService.getByTripId(tripId)
                        .stream()
                        .map(tx -> toDto(tx, user))
                        .toList()
        );
    }

    // ==================== DTO CONVERTER ====================
    private TransactionDto toDto(Transaction tx, User user) {
        ExchangeRate rate = exchangeRateService.getRate(
                tx.getCurrency(), user.getPreferredCurrency()
        ).orElseThrow(() -> new RuntimeException("Missing exchange rate for: "
                + tx.getCurrency() + " → " + user.getPreferredCurrency()));

        BigDecimal convertedAmount = tx.getAmount().multiply(rate.getRate());
        boolean isRecurring = tx instanceof RecurringTransaction;
        RecurringTransaction rtx = isRecurring ? (RecurringTransaction) tx : null;

        return TransactionDto.builder()
                .transactionId(tx.getTransactionId())
                .type(tx.getType() != null ? tx.getType().name() : null)
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .convertedAmount(convertedAmount)
                .convertedCurrency(user.getPreferredCurrency())
                .categoryId(tx.getCategory() != null ? tx.getCategory().getCategoryId() : null)
                .categoryName(tx.getCategory() != null ? tx.getCategory().getName() : null)
                .categoryEmoji(tx.getCategory() != null ? tx.getCategory().getEmoji() : null)
                .date(tx.getDate())
                .description(tx.getDescription())
                .tripId(tx.getTrip() != null ? tx.getTrip().getTripId() : null)
                .tripName(tx.getTrip() != null ? tx.getTrip().getName() : null)
                .recurring(isRecurring)
                .recurrencePattern(isRecurring ? rtx.getRecurrencePattern().name() : null)
                .nextExecution(isRecurring ? rtx.getNextExecution() : null)
                .build();
    }



    private Transaction toEntity(TransactionRequestDto dto, User user) {
        Transaction.TransactionBuilder builder = Transaction.builder()
                .type(TransactionType.valueOf(dto.getType()))
                .amount(dto.getAmount())
                .currency(dto.getCurrency())
                .date(dto.getDate())
                .description(dto.getDescription())
                .user(user);

        if (dto.getCategoryId() != null) {
            builder.category(Category.builder().categoryId(dto.getCategoryId()).build());
        }

        if (dto.getTripId() != null) {
            builder.trip(Trip.builder().tripId(dto.getTripId()).build());
        }

        return builder.build();
    }
}
