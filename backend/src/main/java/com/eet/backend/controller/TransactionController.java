package com.eet.backend.controller;

import com.eet.backend.dto.DashboardDto;
import com.eet.backend.dto.SummaryDto;
import com.eet.backend.model.Budget;
import com.eet.backend.model.Transaction;
import com.eet.backend.model.User;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(transactionService.getAllByUserId(user.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable UUID id) {
        return transactionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        transaction.setUser(user); // Asociamos la transacción con el usuario
        Transaction savedTransaction = transactionService.save(transaction);
        return ResponseEntity.ok(savedTransaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryDto> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        SummaryDto summary = transactionService.getSummary(user);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Transaction>> getRecentTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "5") int limit
    ) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Transaction> recent = transactionService.getRecentByUser(user, limit);
        return ResponseEntity.ok(recent);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboardData(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        BigDecimal balance = transactionService.getBalance(user);
        BigDecimal currentExpenses = transactionService.getCurrentMonthExpenses(user);
        List<Transaction> recent = transactionService.getRecentByUser(user, 5);

        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        BigDecimal maxSpending = null;
        BigDecimal availableBudget = null;

        Optional<Budget> monthlyBudget = budgetService.getMonthlyBudget(user.getUserId(), month, year);
        if (monthlyBudget.isPresent()) {
            maxSpending = monthlyBudget.get().getMaxSpending();
            availableBudget = maxSpending.subtract(currentExpenses);
        }

        DashboardDto dto = new DashboardDto(balance, currentExpenses, maxSpending, availableBudget, recent);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/process-recurring")
    public ResponseEntity<String> processRecurringTransactionsManually(
            @AuthenticationPrincipal UserDetails userDetails) {

        // Solo para asegurarnos de que el usuario existe
        userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Procesa las recurrentes (las que tengan nextExecution <= hoy)
        int processedCount = transactionService.processDueRecurringTransactions();

        return ResponseEntity.ok("Processed " + processedCount + " recurring transactions.");
    }


}
