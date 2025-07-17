package com.eet.backend.controller;

import com.eet.backend.model.ExchangeRate;
import com.eet.backend.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping
    public ResponseEntity<List<ExchangeRate>> getAll() {
        return ResponseEntity.ok(exchangeRateService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExchangeRate> getById(@PathVariable UUID id) {
        Optional<ExchangeRate> rate = exchangeRateService.getById(id);
        return rate.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ExchangeRate> create(@RequestBody ExchangeRate exchangeRate) {
        exchangeRate.setTimestamp(LocalDateTime.now());
        ExchangeRate savedRate = exchangeRateService.save(exchangeRate);
        return ResponseEntity.ok(savedRate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        exchangeRateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
