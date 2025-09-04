package com.eet.backend.services.fx;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Component
@ConditionalOnProperty(name="fx.freecurrency.enabled", havingValue="true")
public class FreeCurrencyApiProvider implements RateProvider {
    private final RestTemplate rest = new RestTemplate();
    @Value("${fx.freecurrency.key}") String apiKey;

    @Override
    public BigDecimal rate(String from, String to, LocalDate date) {
        String ep = (date == null) ? "/latest" : "/historical";
        var uri = UriComponentsBuilder.fromHttpUrl("https://api.freecurrencyapi.com/v1" + ep)
                .queryParam("base_currency", from.toUpperCase())
                .queryParam("currencies", to.toUpperCase())
                .queryParamIfPresent("date", (date == null) ? java.util.Optional.empty() : java.util.Optional.of(date.toString()))
                .build().toUri();

        HttpHeaders h = new HttpHeaders(); h.set("apikey", apiKey);
        Map<?,?> res = rest.exchange(uri, HttpMethod.GET, new HttpEntity<>(h), Map.class).getBody();
        Map<String,Object> data = (Map<String,Object>) res.get("data");

        if (date == null) {
            Object v = data.get(to.toUpperCase());
            if (v == null) throw new IllegalStateException("FreeCurrencyAPI sin tasa latest");
            return new BigDecimal(v.toString());
        } else {
            Map<String,Object> byDate = (Map<String,Object>) data.get(date.toString());
            if (byDate == null || !byDate.containsKey(to.toUpperCase()))
                throw new IllegalStateException("FreeCurrencyAPI sin tasa histórica " + date);
            return new BigDecimal(byDate.get(to.toUpperCase()).toString());
        }
    }
}
