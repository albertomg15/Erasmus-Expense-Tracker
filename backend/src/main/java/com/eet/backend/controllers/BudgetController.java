package com.eet.backend.controller;

import com.eet.backend.dto.BudgetDto;
import com.eet.backend.dto.BudgetWithSpentDto;
import com.eet.backend.model.Budget;
import com.eet.backend.model.User;
import com.eet.backend.service.BudgetService;
import com.eet.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        List<Budget> budgets = budgetService.getByUserId(user.getUserId());
        return ResponseEntity.ok(budgets);
    }


    @GetMapping("/with-spent")
    public ResponseEntity<List<BudgetWithSpentDto>> getBudgetsWithSpent(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return ResponseEntity.ok(budgetService.getBudgetsWithSpent(user.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getById(@PathVariable UUID id) {
        return budgetService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Budget> create(@RequestBody Budget budget,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        budget.setUser(user);

        // 🔒 Si intenta crear un default budget con POST => error
        if (budget.getMonth() == null && budget.getYear() == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Budget saved = budgetService.save(budget);
        return ResponseEntity.ok(saved);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        budgetService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> update(@PathVariable UUID id, @RequestBody Budget updatedBudget,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return (ResponseEntity<Budget>) budgetService.getById(id)
                .map(existing -> {
                    if (!existing.getUser().getUserId().equals(user.getUserId())) {
                        return ResponseEntity.status(403).build(); // Forbidden
                    }
                    existing.setMaxSpending(updatedBudget.getMaxSpending());
                    existing.setWarningThreshold(updatedBudget.getWarningThreshold());
                    existing.setMonth(updatedBudget.getMonth());
                    existing.setYear(updatedBudget.getYear());
                    return ResponseEntity.ok(budgetService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }



    @GetMapping("/monthly")
    public ResponseEntity<List<Budget>> getMonthlyBudgets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        List<Budget> budgets = budgetService.getMonthlyBudgets(user.getUserId());
        return ResponseEntity.ok(budgets);
    }

    @PostMapping("/monthly")
    public ResponseEntity<Budget> saveMonthlyBudget(@RequestBody BudgetDto budgetDto,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Budget saved = budgetService.saveOrUpdateMonthlyBudget(budgetDto, user);
        return ResponseEntity.ok(saved);
    }


}
