package com.eet.backend.dto;

import com.eet.backend.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class DashboardDto {
    private BigDecimal balance;
    private BigDecimal currentMonthExpenses;
    private BigDecimal maxSpending;
    private BigDecimal availableBudget;
    private List<TransactionDto> recentTransactions;
}
