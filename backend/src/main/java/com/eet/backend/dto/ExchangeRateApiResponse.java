package com.eet.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ExchangeRateApiResponse {
    private boolean success;
    private String base;
    private String date;
    private Map<String, BigDecimal> rates;
}
