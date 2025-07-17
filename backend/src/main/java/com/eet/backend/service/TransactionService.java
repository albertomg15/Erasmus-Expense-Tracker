package com.eet.backend.service;

import com.eet.backend.model.Transaction;
import com.eet.backend.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<Transaction> getAllByUserId(UUID userId) {
        return transactionRepository.findByUserUserId(userId);
    }

    public Optional<Transaction> getById(UUID id) {
        return transactionRepository.findById(id);
    }

    public Transaction save(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public void delete(UUID id) {
        transactionRepository.deleteById(id);
    }
}
