package com.eet.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "recurring_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTransaction extends Transaction {

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_pattern", nullable = false)
    private RecurrencePattern recurrencePattern;

    // Fecha en la que empieza la recurrencia (opcional si coincide con `date` de la transacción original)
    @Column(name = "recurrence_start_date")
    private LocalDate recurrenceStartDate;

    // Fecha en la que finaliza la recurrencia (puede ser null si es indefinida)
    @Column(name = "recurrence_end_date")
    private LocalDate recurrenceEndDate;

    // Fecha prevista para la próxima ejecución (usada por el scheduler)
    @Column(name = "next_execution", nullable = false)
    private LocalDate nextExecution;

    // Número máximo de ejecuciones (puede ser null si es indefinido)
    @Column(name = "max_occurrences")
    private Integer maxOccurrences;

    // Cuántas veces ya se ha ejecutado
    @Column(name = "executed_occurrences")
    private Integer executedOccurrences = 0;

    // Opcional: útil si quieres permitir pausar sin eliminar
    @Column(name = "active", nullable = false)
    private boolean active = true;
}
