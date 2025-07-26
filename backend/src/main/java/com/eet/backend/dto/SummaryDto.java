package com.eet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SummaryDto {
    private BigDecimal balance;
    private BigDecimal currentMonthExpenses;
    private String currency;  // Moneda en la que están expresadas las cifras
}
