package com.eet.backend.repositories;

import com.eet.backend.model.RecurringTransaction;
import com.eet.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {
    List<RecurringTransaction> findByActiveTrueAndNextExecutionLessThanEqual(LocalDate date);
    List<RecurringTransaction> findByUserAndActiveTrueAndNextExecutionLessThanEqual(User user, LocalDate date);

}
