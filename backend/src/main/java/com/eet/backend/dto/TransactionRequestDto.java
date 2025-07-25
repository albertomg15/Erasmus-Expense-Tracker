package com.eet.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TransactionRequestDto {
    private String type; // "INCOME" o "EXPENSE"
    private BigDecimal amount;
    private String currency;
    private UUID categoryId;
    private UUID tripId; // puede ser null
    private LocalDate date;
    private String description;
}
