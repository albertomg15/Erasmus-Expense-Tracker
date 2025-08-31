package com.eet.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

import com.eet.backend.model.TransactionType;
import com.eet.backend.model.RecurrencePattern;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
@Data
public class RecurringTransactionUpdateDTO {
    private TransactionType type;
    private BigDecimal amount;
    private String currency;
    private LocalDate date;
    private String description;
    private UUID categoryId;
    private UUID tripId;

    private RecurrencePattern recurrencePattern;
    private LocalDate nextExecution;
    private LocalDate recurrenceEndDate;
    private Integer maxOccurrences;
    private Boolean active;
}
