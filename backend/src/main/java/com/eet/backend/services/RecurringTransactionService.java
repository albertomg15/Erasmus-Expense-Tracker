package com.eet.backend.service;

import com.eet.backend.dto.RecurringTransactionCreateDTO;
import com.eet.backend.model.*;
import com.eet.backend.repository.CategoryRepository;
import com.eet.backend.repository.RecurringTransactionRepository;
import com.eet.backend.repository.TripRepository;
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

    private final CategoryRepository categoryRepository;
    private final TripRepository tripRepository;

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

    @Transactional
    public RecurringTransaction createFromDto(RecurringTransactionCreateDTO dto, User user) {

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        Trip trip = null;
        if (dto.getTripId() != null) {
            trip = tripRepository.findById(dto.getTripId())
                    .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado"));
        }

        // Mapear campos base de Transaction
        RecurringTransaction entity = new RecurringTransaction();
        entity.setUser(user);
        entity.setCategory(category);
        entity.setTrip(trip);
        entity.setType(dto.getType());
        entity.setAmount(dto.getAmount());
        entity.setCurrency(dto.getCurrency());
        entity.setDate(dto.getDate());
        entity.setDescription(dto.getDescription());

        // Mapear recurrencia
        entity.setRecurrencePattern(dto.getRecurrencePattern());
        entity.setRecurrenceStartDate(dto.getRecurrenceStartDate() != null ? dto.getRecurrenceStartDate() : dto.getDate());
        entity.setRecurrenceEndDate(dto.getRecurrenceEndDate());

        // Si no te fías del front, calcula nextExecution tú
        entity.setNextExecution(dto.getNextExecution() != null ? dto.getNextExecution() : calcNextExecution(entity));

        entity.setMaxOccurrences(dto.getMaxOccurrences());
        entity.setExecutedOccurrences(0);
        entity.setActive(true);

        return recurringTransactionRepository.save(entity);
    }
    private LocalDate getNextExecutionDate(LocalDate current, RecurrencePattern pattern) {
        return switch (pattern) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
    }

    private LocalDate calcNextExecution(RecurringTransaction e) {
        // Ejemplo naive: next = start date (o date) si es futuro; si no, sumar según patrón
        LocalDate base = e.getRecurrenceStartDate() != null ? e.getRecurrenceStartDate() : e.getDate();
        if (base.isAfter(LocalDate.now())) return base;

        return switch (e.getRecurrencePattern()) {
            case DAILY -> LocalDate.now().plusDays(1);
            case WEEKLY -> LocalDate.now().plusWeeks(1);
            case MONTHLY -> LocalDate.now().plusMonths(1);
            case YEARLY -> LocalDate.now().plusYears(1);
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
