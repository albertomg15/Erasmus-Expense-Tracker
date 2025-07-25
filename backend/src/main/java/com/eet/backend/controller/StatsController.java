package com.eet.backend.controller;

import com.eet.backend.dto.stats.*;
import com.eet.backend.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/monthly-summary")
    public ResponseEntity<MonthlySummaryDto> getMonthlySummary(
            @RequestParam UUID userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        MonthlySummaryDto summary = statsService.getMonthlySummary(userId, month, year);
        return ResponseEntity.ok(summary);
    }


    @GetMapping("/monthly-evolution")
    public ResponseEntity<List<MonthlyEvolutionEntryDto>> getMonthlyEvolution(
            @RequestParam UUID userId,
            @RequestParam(defaultValue = "6") int monthsBack
    ) {
        List<MonthlyEvolutionEntryDto> data = statsService.getMonthlyEvolution(userId, monthsBack);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/income-vs-expense")
    public ResponseEntity<IncomeVsExpenseDto> getIncomeVsExpense(
            @RequestParam UUID userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(statsService.getIncomeVsExpense(userId, month, year));
    }

    @GetMapping("/monthly-comparison")
    public ResponseEntity<List<MonthlyComparisonDto>> getMonthlyComparison(
            @RequestParam UUID userId,
            @RequestParam(defaultValue = "6") int monthsBack
    ) {
        return ResponseEntity.ok(statsService.getMonthlyComparison(userId, monthsBack));
    }

    @GetMapping("/trip-spending")
    public ResponseEntity<List<TripSpendingDto>> getTripSpending(
            @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(statsService.getTripSpendingByUser(userId));
    }

    @GetMapping("/annual-summary")
    public ResponseEntity<AnnualSummaryDto> getAnnualSummary(
            @RequestParam UUID userId,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(statsService.getAnnualSummary(userId, year));
    }

}


