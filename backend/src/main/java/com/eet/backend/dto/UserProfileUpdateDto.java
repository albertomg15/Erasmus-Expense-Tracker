package com.eet.backend.dto;


import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class UserProfileUpdateDto {
    @NotBlank
    private String preferredCurrency;

    @NotBlank
    private String language;

    private String country; // opcional, puede estar vacío o nulo
    private boolean consentToDataAnalysis;
}



