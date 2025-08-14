package com.eet.backend.repository;

import com.eet.backend.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {
    List<RecurringTransaction> findByActiveTrueAndNextExecutionLessThanEqual(LocalDate date);

}
