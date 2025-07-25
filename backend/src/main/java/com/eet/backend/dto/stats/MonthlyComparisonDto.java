// dto/stats/MonthlyComparisonDto.java
package com.eet.backend.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class MonthlyComparisonDto {
    private int month; // 1-12
    private int year;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private Map<String, BigDecimal> incomeByCategory;
    private Map<String, BigDecimal> expenseByCategory;
}
