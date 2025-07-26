package com.eet.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrencyConversionRequestDto {
    private BigDecimal amount;
    private String fromCurrency;
    private String toCurrency;
}
