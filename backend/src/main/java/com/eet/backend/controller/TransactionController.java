package com.eet.backend.controller;

import com.eet.backend.dto.DashboardDto;
import com.eet.backend.dto.SummaryDto;
import com.eet.backend.dto.TransactionDto;
import com.eet.backend.model.*;
import com.eet.backend.service.BudgetService;
import com.eet.backend.service.TransactionService;
import com.eet.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;import com.eet.backend.dto.TransactionRequestDto; // Asegúrate de importar esto


@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final BudgetService budgetService;

    // ==================== UTIL ====================
    private User getAuthenticatedUser(UserDetails userDetails) {
        return userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // ==================== CRUD ====================
    @GetMapping
    public ResponseEntity<List<TransactionDto>> getAllTransactions(@AuthenticationPrincipal UserDetails userDetails) {
        List<Transaction> transactions = transactionService.getAllByUserId(getAuthenticatedUser(userDetails).getUserId());

        List<TransactionDto> dtos = transactions.stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable UUID id) {
        return transactionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody TransactionRequestDto dto,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Transaction transaction = toEntity(dto, user);
        Transaction saved = transactionService.save(transaction);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable UUID id,
                                                         @RequestBody TransactionRequestDto dto,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Lo convertimos a entidad base para pasar a service.update(...)
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
        return ResponseEntity.ok(transactionService.getSummary(getAuthenticatedUser(userDetails)));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(transactionService.getRecentByUser(getAuthenticatedUser(userDetails), limit));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboardData(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);

        BigDecimal balance = transactionService.getBalance(user);
        BigDecimal currentExpenses = transactionService.getCurrentMonthExpenses(user);

        Optional<Budget> monthlyBudget = budgetService.getMonthlyBudget(
                user.getUserId(),
                LocalDate.now().getMonthValue(),
                LocalDate.now().getYear()
        );

        BigDecimal maxSpending = monthlyBudget.map(Budget::getMaxSpending).orElse(null);
        BigDecimal availableBudget = (maxSpending != null) ? maxSpending.subtract(currentExpenses) : null;

        DashboardDto dto = new DashboardDto(
                balance,
                currentExpenses,
                maxSpending,
                availableBudget,
                transactionService.getRecentByUser(user, 5)
        );

        return ResponseEntity.ok(dto);
    }

    // ==================== RECURRENTES ====================
    @PostMapping("/process-recurring")
    public ResponseEntity<String> processRecurringTransactionsManually(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        getAuthenticatedUser(userDetails); // valida usuario
        int processed = transactionService.processDueRecurringTransactions();
        return ResponseEntity.ok("Processed " + processed + " recurring transactions.");
    }

    // ==================== TRIP RELACIONADO ====================
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<TransactionDto>> getByTripId(@PathVariable UUID tripId) {
        return ResponseEntity.ok(
                transactionService.getByTripId(tripId)
                        .stream()
                        .map(this::toDto)
                        .toList()
        );
    }

    // ==================== DTO CONVERTER ====================
    private TransactionDto toDto(Transaction tx) {
        return TransactionDto.builder()
                .transactionId(tx.getTransactionId())
                .type(tx.getType().name())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .categoryName(tx.getCategory().getName())
                .categoryEmoji(tx.getCategory().getEmoji())
                .date(tx.getDate())
                .description(tx.getDescription())
                .tripId(tx.getTrip() != null ? tx.getTrip().getTripId() : null)
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
