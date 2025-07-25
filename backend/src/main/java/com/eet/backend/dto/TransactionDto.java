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
    private LocalDate date;
    private String description;
    private UUID tripId;
    private String tripName; // nuevo campo opcional

}

