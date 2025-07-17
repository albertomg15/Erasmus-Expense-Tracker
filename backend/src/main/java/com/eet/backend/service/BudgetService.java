package com.eet.backend.service;

import com.eet.backend.model.Budget;
import com.eet.backend.repository.BudgetRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
