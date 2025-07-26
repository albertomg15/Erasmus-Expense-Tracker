package com.eet.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@Getter
public class CurrencyConfig {

    @Value("#{'${app.supported-currencies}'.split(',')}")
    private List<String> supportedCurrencies;
}
