package com.eet.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDto {

    private Integer month;  // Puede ser null si es presupuesto por defecto
    private Integer year;   // Puede ser null si es presupuesto por defecto

    private BigDecimal maxSpending;
    private BigDecimal warningThreshold;
}
