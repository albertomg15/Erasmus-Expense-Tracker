package com.eet.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String preferredCurrency;
    private String language;
    private String country; // nuevo campo
}
