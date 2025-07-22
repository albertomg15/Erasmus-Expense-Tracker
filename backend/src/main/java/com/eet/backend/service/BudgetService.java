package com.eet.backend.service;

import com.eet.backend.dto.BudgetDto;
import com.eet.backend.model.Budget;
import com.eet.backend.model.User;
import com.eet.backend.repository.BudgetRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public List<Budget> getByUserId(UUID userId) {
        return budgetRepository.findByUserUserId(userId);
    }

    public Optional<Budget> getById(UUID id) {
        return budgetRepository.findById(id);
    }

    public Budget save(Budget budget) {
        return budgetRepository.save(budget);
    }

    public void delete(UUID id) {
        budgetRepository.deleteById(id);
    }

    public Optional<Budget> getDefaultBudget(UUID userId) {
        return budgetRepository.findByUserUserIdAndMonthIsNullAndYearIsNull(userId);
    }

    public Budget saveOrUpdateDefaultBudget(UUID userId, BigDecimal maxSpending, BigDecimal warningThreshold) {
        return budgetRepository.findByUserUserIdAndMonthIsNullAndYearIsNull(userId)
                .map(existing -> {
                    existing.setMaxSpending(maxSpending);
                    existing.setWarningThreshold(warningThreshold);
                    return budgetRepository.save(existing);
                })
                .orElseGet(() -> {
                    Budget newBudget = Budget.builder()
                            .user(User.builder().userId(userId).build()) // usar solo ID para evitar ciclo
                            .maxSpending(maxSpending)
                            .warningThreshold(warningThreshold)
                            .build();
                    return budgetRepository.save(newBudget);
                });
    }

    public List<Budget> getMonthlyBudgets(UUID userId) {
        return budgetRepository.findByUserUserIdAndMonthIsNotNullAndYearIsNotNull(userId);
    }

    public Budget saveOrUpdateMonthlyBudget(BudgetDto dto, User user) {
        Optional<Budget> existing = budgetRepository
                .findByUserAndMonthAndYear(user, dto.getMonth(), dto.getYear());

        Budget budget = existing.orElse(new Budget());
        budget.setUser(user);
        budget.setMonth(dto.getMonth());
        budget.setYear(dto.getYear());
        budget.setMaxSpending(dto.getMaxSpending());
        budget.setWarningThreshold(dto.getWarningThreshold());

        return budgetRepository.save(budget);
    }

    public Optional<Budget> getMonthlyBudget(UUID userId, int month, int year) {
        return budgetRepository.findByUserUserIdAndMonthAndYear(userId, month, year);
    }

}
