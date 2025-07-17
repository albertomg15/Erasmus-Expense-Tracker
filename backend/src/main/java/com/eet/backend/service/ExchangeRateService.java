package com.eet.backend.service;

import com.eet.backend.model.ExchangeRate;
import com.eet.backend.repository.ExchangeRateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;

    public List<ExchangeRate> getAll() {
        return exchangeRateRepository.findAll();
    }

    public Optional<ExchangeRate> getById(UUID id) {
        return exchangeRateRepository.findById(id);
    }

    public ExchangeRate save(ExchangeRate rate) {
        return exchangeRateRepository.save(rate);
    }

    public void delete(UUID id) {
        exchangeRateRepository.deleteById(id);
    }
}
