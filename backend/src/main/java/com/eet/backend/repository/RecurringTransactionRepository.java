package com.eet.backend.repository;

import com.eet.backend.model.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {
}
