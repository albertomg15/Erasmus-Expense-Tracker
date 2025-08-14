package com.eet.backend.repository;

import com.eet.backend.model.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

import java.util.UUID;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, UUID> {

    Optional<ExchangeRate> findByFromCurrencyAndToCurrencyAndDate(String fromCurrency, String toCurrency, LocalDate date);


}
