package com.eet.backend.service;

import com.eet.backend.model.RecurringTransaction;
import com.eet.backend.repository.RecurringTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;

    public List<RecurringTransaction> getAll() {
        return recurringTransactionRepository.findAll();
    }

    public Optional<RecurringTransaction> getById(UUID id) {
        return recurringTransactionRepository.findById(id);
    }

    public RecurringTransaction save(RecurringTransaction transaction) {
        return recurringTransactionRepository.save(transaction);
    }

    public void delete(UUID id) {
        recurringTransactionRepository.deleteById(id);
    }
}
