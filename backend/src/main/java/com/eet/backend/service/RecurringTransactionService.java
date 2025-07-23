package com.eet.backend.service;

import com.eet.backend.model.RecurrencePattern;
import com.eet.backend.model.RecurringTransaction;
import com.eet.backend.model.Transaction;
import com.eet.backend.model.User;
import com.eet.backend.repository.RecurringTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.eet.backend.model.RecurrencePattern.*;

@Service
@RequiredArgsConstructor
@Transactional
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;

    private final TransactionService transactionService;

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

    public void processDueTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions =
                recurringTransactionRepository.findByActiveTrueAndNextExecutionLessThanEqual(today);

        for (RecurringTransaction recurring : dueTransactions) {
            // Crear nueva transacción normal clonando datos
            Transaction newTx = Transaction.builder()
                    .type(recurring.getType())
                    .amount(recurring.getAmount())
                    .currency(recurring.getCurrency())
                    .date(today)
                    .description(recurring.getDescription())
                    .user(recurring.getUser())
                    .trip(recurring.getTrip())
                    .category(recurring.getCategory())
                    .build();

            // Guardar transacción (suponiendo que tienes acceso a TransactionService o TransactionRepository)
            transactionService.save(newTx); // o transactionRepository.save(newTx)

            // Actualizar la recurrente
            recurring.setExecutedOccurrences(recurring.getExecutedOccurrences() + 1);
            recurring.setNextExecution(getNextExecutionDate(recurring.getNextExecution(), recurring.getRecurrencePattern()));

            // Si ha alcanzado el límite, desactiva
            if ((recurring.getRecurrenceEndDate() != null && recurring.getNextExecution().isAfter(recurring.getRecurrenceEndDate())) ||
                    (recurring.getMaxOccurrences() != null && recurring.getExecutedOccurrences() >= recurring.getMaxOccurrences())) {
                recurring.setActive(false);
            }

            // Guardar cambios
            recurringTransactionRepository.save(recurring);
        }

    }

    private LocalDate getNextExecutionDate(LocalDate current, RecurrencePattern pattern) {
        return switch (pattern) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
    }

    public Optional<RecurringTransaction> update(UUID id, RecurringTransaction updated, User user) {
        return recurringTransactionRepository.findById(id)
                .filter(tx -> tx.getUser().getUserId().equals(user.getUserId()))
                .map(existing -> {
                    existing.setAmount(updated.getAmount());
                    existing.setCurrency(updated.getCurrency());
                    existing.setDate(updated.getDate());
                    existing.setDescription(updated.getDescription());
                    existing.setType(updated.getType());
                    existing.setCategory(updated.getCategory());
                    existing.setTrip(updated.getTrip());

                    // Campos específicos de recurrentes
                    existing.setRecurrencePattern(updated.getRecurrencePattern());
                    existing.setNextExecution(updated.getNextExecution());
                    existing.setRecurrenceEndDate(updated.getRecurrenceEndDate());
                    existing.setMaxOccurrences(updated.getMaxOccurrences());
                    existing.setActive(updated.isActive());

                    return recurringTransactionRepository.save(existing);
                });
    }
}
