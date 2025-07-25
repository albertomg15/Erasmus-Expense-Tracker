// dto/stats/TripSpendingDto.java
package com.eet.backend.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class TripSpendingDto {
    private UUID tripId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String currency;
    private BigDecimal totalSpent;
    private Map<String, BigDecimal> expenseByCategory;
}
