package com.eet.backend.controllers;

import com.eet.backend.dto.CountryComparisonResponse;
import com.eet.backend.model.User;
import com.eet.backend.services.CountrySpendingStatsService;
import com.eet.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/country-comparison")
@RequiredArgsConstructor
public class CountryComparisonController {

    private final CountrySpendingStatsService statsService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<CountryComparisonResponse> getComparison(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int month,
            @RequestParam int year
    ) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.getConsentToDataAnalysis()) || user.getCountry() == null) {
            return ResponseEntity.badRequest().build();
        }

        CountryComparisonResponse response = statsService.getComparisonForUser(user, year, month);
        return ResponseEntity.ok(response);
    }
}
