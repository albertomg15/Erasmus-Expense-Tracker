package com.eet.backend.controller;

import com.eet.backend.config.CurrencyConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyConfig currencyConfig;

    @GetMapping
    public ResponseEntity<List<String>> getSupportedCurrencies() {
        return ResponseEntity.ok(currencyConfig.getSupportedCurrencies());
    }
}
