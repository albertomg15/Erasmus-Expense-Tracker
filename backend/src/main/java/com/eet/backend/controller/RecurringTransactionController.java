package com.eet.backend.controller;

import com.eet.backend.model.RecurringTransaction;
import com.eet.backend.model.User;
import com.eet.backend.service.RecurringTransactionService;
import com.eet.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recurring-transactions")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<RecurringTransaction>> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<RecurringTransaction> all = recurringTransactionService.getAll().stream()
                .filter(tx -> tx.getUser().getUserId().equals(user.getUserId()))
                .toList();

        return ResponseEntity.ok(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringTransaction> getById(@PathVariable UUID id) {
        return recurringTransactionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RecurringTransaction> create(@RequestBody RecurringTransaction recurringTransaction,
                                                       @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        recurringTransaction.setUser(user);
        RecurringTransaction saved = recurringTransactionService.save(recurringTransaction);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        recurringTransactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
