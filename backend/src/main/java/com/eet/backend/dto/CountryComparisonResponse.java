package com.eet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CountryComparisonResponse {
    private boolean incompleteData;
    private List<CountryComparisonDto> comparisons;
}
