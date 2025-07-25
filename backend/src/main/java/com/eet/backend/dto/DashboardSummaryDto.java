package com.eet.backend.dto;

import com.eet.backend.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class DashboardSummaryDto {
    private BigDecimal totalBalance;
    private BigDecimal currentMonthExpenses;
    private List<Transaction> recentTransactions;
}
