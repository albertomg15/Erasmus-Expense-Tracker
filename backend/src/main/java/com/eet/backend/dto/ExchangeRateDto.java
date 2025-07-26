package com.eet.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExchangeRateDto {
    private String fromCurrency;
    private String toCurrency;
    private BigDecimal rate;
    private LocalDate date;
}
