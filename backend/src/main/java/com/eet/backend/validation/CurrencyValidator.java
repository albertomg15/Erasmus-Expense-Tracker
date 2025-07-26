package com.eet.backend.validation;

import com.eet.backend.config.CurrencyConfig;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrencyValidator implements ConstraintValidator<ValidCurrency, String> {

    private final CurrencyConfig currencyConfig;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return currencyConfig.getSupportedCurrencies().contains(value.toUpperCase());
    }
}
