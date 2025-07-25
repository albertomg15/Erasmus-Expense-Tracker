package com.eet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRequestDto {

    private String name;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double estimatedBudget;
    private String notes;
    private List<String> tags;
    private String currency;

}
