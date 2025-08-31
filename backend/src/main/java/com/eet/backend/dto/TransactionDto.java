package com.eet.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDto {
    private UUID transactionId;
    private String type;  // "INCOME" o "EXPENSE"
    private BigDecimal amount;
    private String currency;
    private String categoryName;
    private String categoryEmoji;
    private UUID categoryId;
    private LocalDate date;
    private String description;
    private UUID tripId;
    private Boolean recurring;
    private String  recurrencePattern;
    private LocalDate nextExecution;
    private String tripName; // nuevo campo opcional
    private BigDecimal convertedAmount; // cantidad en moneda preferida del usuario
    private String convertedCurrency;   // ISO de la moneda preferida


}

