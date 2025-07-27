package com.eet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CountryComparisonDtoResponse {
    private String category;
    private BigDecimal userAverage;
    private BigDecimal countryAverage;
    private String currency;
}
