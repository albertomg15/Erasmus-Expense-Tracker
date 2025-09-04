package com.eet.backend.services.fx;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface RateProvider {
    BigDecimal rate(String from, String to, LocalDate date);
}
