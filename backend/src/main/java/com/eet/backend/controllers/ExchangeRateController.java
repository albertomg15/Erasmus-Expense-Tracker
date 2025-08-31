package com.eet.backend.controllers;

import com.eet.backend.dto.*;
import com.eet.backend.model.ExchangeRate;
import com.eet.backend.services.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping
    public List<ExchangeRateDto> getAllRates() {
        return exchangeRateService.getAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping("/convert")
    public ResponseEntity<CurrencyConversionResponseDto> convert(@RequestBody CurrencyConversionRequestDto request) {
        BigDecimal converted = exchangeRateService.convert(
                request.getAmount(),
                request.getFromCurrency(),
                request.getToCurrency());

        BigDecimal rate = exchangeRateService.getRate(
                request.getFromCurrency(),
                request.getToCurrency(),
                LocalDate.now()
        ).map(ExchangeRate::getRate).orElse(BigDecimal.ONE); // fallback por seguridad

        return ResponseEntity.ok(
                CurrencyConversionResponseDto.builder()
                        .originalAmount(request.getAmount())
                        .fromCurrency(request.getFromCurrency().toUpperCase())
                        .toCurrency(request.getToCurrency().toUpperCase())
                        .convertedAmount(converted)
                        .exchangeRate(rate)
                        .build()
        );
    }

    private ExchangeRateDto toDto(ExchangeRate rate) {
        return ExchangeRateDto.builder()
                .fromCurrency(rate.getFromCurrency())
                .toCurrency(rate.getToCurrency())
                .rate(rate.getRate())
                .date(rate.getDate())
                .build();
    }
}
