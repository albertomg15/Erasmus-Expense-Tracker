package com.eet.backend.repository;

import com.eet.backend.model.CountrySpendingStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public interface CountrySpendingStatsRepository extends JpaRepository<CountrySpendingStats, Long> {
    Optional<CountrySpendingStats> findByCountryAndCategory(String country, String category);

    List<CountrySpendingStats> findByCountry(String country); // <-- ESTE MÉTODO
}
