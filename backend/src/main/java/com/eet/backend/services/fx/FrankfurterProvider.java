package com.eet.backend.services.fx;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Component
public class FrankfurterProvider implements RateProvider {
    private static final String BASE = "https://api.frankfurter.dev/v1";
    private final RestTemplate rest = new RestTemplate();

    @Override
    public BigDecimal rate(String from, String to, LocalDate date) {
        String path = (date == null) ? "/latest" : "/" + date;
        String url = BASE + path + "?base=" + from.toUpperCase() + "&symbols=" + to.toUpperCase();
        Map<?,?> json = rest.getForObject(url, Map.class);
        Map<String,Object> rates = (Map<String,Object>) json.get("rates");
        if (rates == null || !rates.containsKey(to.toUpperCase()))
            throw new IllegalStateException("Frankfurter sin tasa " + from + "->" + to);
        return new BigDecimal(rates.get(to.toUpperCase()).toString());
    }
}
