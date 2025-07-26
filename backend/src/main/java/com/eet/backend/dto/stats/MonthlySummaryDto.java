package com.eet.backend.dto.stats;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlySummaryDto {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private BigDecimal monthlyBudget;
    private BigDecimal budgetUsedPercent;
    private Map<String, BigDecimal> expensesByCategory;
    private String convertedCurrency;

}
