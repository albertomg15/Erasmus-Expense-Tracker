package com.eet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetWithSpentDto {
    private UUID budgetId;
    private Integer month;
    private Integer year;
    private BigDecimal maxSpending;
    private BigDecimal warningThreshold;
    private BigDecimal spent;
}
