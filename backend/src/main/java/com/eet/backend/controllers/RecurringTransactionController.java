package com.eet.backend.controller;

import com.eet.backend.dto.RecurringTransactionCreateDTO;
import com.eet.backend.model.RecurringTransaction;
import com.eet.backend.model.User;
import com.eet.backend.service.RecurringTransactionService;
import com.eet.backend.service.UserService;
import jakarta.validation.Valid;
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
    public ResponseEntity<RecurringTransaction> create(
            @Valid @RequestBody RecurringTransactionCreateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        RecurringTransaction saved = recurringTransactionService.createFromDto(dto, user);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        recurringTransactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransaction> updateRecurringTransaction(@PathVariable UUID id,
                                                                           @RequestBody RecurringTransaction updatedTransaction,
                                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return recurringTransactionService.update(id, updatedTransaction, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
