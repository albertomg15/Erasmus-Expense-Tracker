package com.eet.backend.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDto {

    private UUID tripId;

    private String name;

    private String destination;

    private LocalDate startDate;

    private LocalDate endDate;

    private Double estimatedBudget;

    private String notes;

    private List<String> tags; // solo nombres de los tags

    private String currency;


}
