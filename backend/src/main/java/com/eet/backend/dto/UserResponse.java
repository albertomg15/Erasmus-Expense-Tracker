package com.eet.backend.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class UserResponse {
    private UUID userId;
    private String email;
    private String preferredCurrency;
    private String language;
    private String country;
    private boolean consentToDataAnalysis;
}

