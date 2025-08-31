package com.eet.backend.repositories;

import com.eet.backend.model.Budget;
import com.eet.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByUserUserId(UUID userId);

    Optional<Budget> findByUserAndMonthAndYear(User user, int month, int year);

    Optional<Budget> findByUserUserIdAndMonthAndYear(UUID userId, int month, int year);

    Optional<Budget> findByUserUserIdAndMonthIsNullAndYearIsNull(UUID userId);

    List<Budget> findByUserUserIdAndMonthIsNotNullAndYearIsNotNull(UUID userId);
}
