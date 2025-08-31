package com.eet.backend.services;

import com.eet.backend.dto.RecurringTransactionCreateDTO;
import com.eet.backend.dto.RecurringTransactionUpdateDTO;
import com.eet.backend.model.*;
import com.eet.backend.repositories.CategoryRepository;
import com.eet.backend.repositories.RecurringTransactionRepository;
import com.eet.backend.repositories.TripRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    @Transactional
    public int processDueTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> due =
                recurringTransactionRepository.findByActiveTrueAndNextExecutionLessThanEqual(today);

        int created = 0;

        for (RecurringTransaction rt : due) {
            // Crea todas las ocurrencias pendientes hasta hoy
            while (rt.isActive()
                    && !isFinished(rt)
                    && !rt.getNextExecution().isAfter(today)) {

                Transaction newTx = Transaction.builder()
                        .type(rt.getType())
                        .amount(rt.getAmount())
                        .currency(rt.getCurrency())
                        .date(rt.getNextExecution()) // 👈 FECHA CORRECTA
                        .description(rt.getDescription())
                        .user(rt.getUser())
                        .trip(rt.getTrip())
                        .category(rt.getCategory())
                        .build();

                transactionService.save(newTx);
                created++;

                // Avanza estado
                rt.setExecutedOccurrences(
                        (rt.getExecutedOccurrences() == null ? 0 : rt.getExecutedOccurrences()) + 1
                );
                rt.setNextExecution(nextDate(rt.getNextExecution(), rt.getRecurrencePattern()));

                if (isFinished(rt)) {
                    rt.setActive(false);
                }
            }
            recurringTransactionRepository.save(rt);
        }
        return created;
    }

    private boolean isFinished(RecurringTransaction rt) {
        boolean byDate = rt.getRecurrenceEndDate() != null
                && rt.getNextExecution().isAfter(rt.getRecurrenceEndDate());
        boolean byCount = rt.getMaxOccurrences() != null
                && rt.getExecutedOccurrences() != null
                && rt.getExecutedOccurrences() >= rt.getMaxOccurrences();
        return byDate || byCount;
    }

    private LocalDate nextDate(LocalDate current, RecurrencePattern pattern) {
        return switch (pattern) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
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

        boolean fill = Boolean.TRUE.equals(dto.getFillPastOccurrences());

        if (fill) {
            // empezar desde el inicio para permitir catch-up completo
            entity.setNextExecution(entity.getRecurrenceStartDate());
        } else {
            // comportamiento actual (futuro)
            entity.setNextExecution(dto.getNextExecution() != null ? dto.getNextExecution() : calcNextExecution(entity));
        }


        entity.setMaxOccurrences(dto.getMaxOccurrences());
        entity.setExecutedOccurrences(0);
        entity.setActive(true);

        RecurringTransaction saved = recurringTransactionRepository.save(entity);

        if (fill) {
            // procesar SOLO esta recurrente
            processOneRecurring(saved);
            // re-cargar por si cambió nextExecution/active
            saved = recurringTransactionRepository.findById(saved.getTransactionId()).orElse(saved);
        }


        return saved;

    }

    private void processOneRecurring(RecurringTransaction rt) {
        LocalDate today = LocalDate.now();
        if (rt.getExecutedOccurrences() == null) rt.setExecutedOccurrences(0);
        if (rt.getNextExecution() == null) rt.setNextExecution(calcNextExecution(rt));

        while (rt.isActive() && !isFinished(rt) && !rt.getNextExecution().isAfter(today)) {
            Transaction newTx = Transaction.builder()
                    .type(rt.getType())
                    .amount(rt.getAmount())
                    .currency(rt.getCurrency())
                    .date(rt.getNextExecution())
                    .description(rt.getDescription())
                    .user(rt.getUser())
                    .trip(rt.getTrip())
                    .category(rt.getCategory())
                    .build();

            transactionService.save(newTx);

            rt.setExecutedOccurrences(rt.getExecutedOccurrences() + 1);
            rt.setNextExecution(nextDate(rt.getNextExecution(), rt.getRecurrencePattern()));

            if (isFinished(rt)) rt.setActive(false);
        }
        recurringTransactionRepository.save(rt);
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

    public Optional<RecurringTransaction> updateFromDto(UUID id, RecurringTransactionUpdateDTO dto, User user) {
        return recurringTransactionRepository.findById(id)
                .filter(tx -> tx.getUser().getUserId().equals(user.getUserId()))
                .map(existing -> {
                    existing.setType(dto.getType());
                    existing.setAmount(dto.getAmount());
                    existing.setCurrency(dto.getCurrency());
                    existing.setDate(dto.getDate());
                    existing.setDescription(dto.getDescription());

                    if (dto.getCategoryId() != null) {
                        Category cat = categoryRepository.findById(dto.getCategoryId())
                                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
                        existing.setCategory(cat);
                    }

                    if (dto.getTripId() != null) {
                        Trip trip = tripRepository.findById(dto.getTripId())
                                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado"));
                        existing.setTrip(trip);
                    } else {
                        existing.setTrip(null);
                    }

                    // recurrente
                    existing.setRecurrencePattern(dto.getRecurrencePattern());
                    existing.setNextExecution(dto.getNextExecution());
                    existing.setRecurrenceEndDate(dto.getRecurrenceEndDate());
                    existing.setMaxOccurrences(dto.getMaxOccurrences());
                    if (dto.getActive() != null) existing.setActive(dto.getActive());

                    return recurringTransactionRepository.save(existing);
                });
    }


    // RecurringTransactionService
    @Transactional
    public int processDueTransactionsForUser(User user) {
        LocalDate today = LocalDate.now();

        // Trae solo las recurrentes del usuario que están vencidas o al día de hoy y activas
        List<RecurringTransaction> due = recurringTransactionRepository
                .findByUserAndActiveTrueAndNextExecutionLessThanEqual(user, today);

        int created = 0;

        for (RecurringTransaction rt : due) {
            // Normaliza fechas nulas por si acaso
            if (rt.getNextExecution() == null) {
                rt.setNextExecution(calcNextExecution(rt));
            }
            if (rt.getExecutedOccurrences() == null) {
                rt.setExecutedOccurrences(0);
            }

            // Crea TODAS las ocurrencias pendientes hasta hoy (catch-up)
            while (rt.isActive()
                    && !isFinished(rt)
                    && !rt.getNextExecution().isAfter(today)) {

                // Crear transacción NORMAL fechada en la ejecución programada
                Transaction newTx = Transaction.builder()
                        .type(rt.getType())
                        .amount(rt.getAmount())
                        .currency(rt.getCurrency())
                        .date(rt.getNextExecution()) // ← fecha correcta
                        .description(rt.getDescription())
                        .user(rt.getUser())          // o 'user' (equivalen)
                        .trip(rt.getTrip())
                        .category(rt.getCategory())
                        .build();

                transactionService.save(newTx);
                created++;

                // Avanza estado de la recurrente
                rt.setExecutedOccurrences(rt.getExecutedOccurrences() + 1);
                rt.setNextExecution(nextDate(rt.getNextExecution(), rt.getRecurrencePattern()));

                if (isFinished(rt)) {
                    rt.setActive(false);
                }
            }

            // Guarda cambios de la recurrente (nextExecution/occurrences/active)
            recurringTransactionRepository.save(rt);
        }

        return created;
    }

}
