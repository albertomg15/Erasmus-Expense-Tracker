package com.eet.backend.dto.stats;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyEvolutionEntryDto {
    private String month; // Formato YYYY-MM
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal balance;
}
