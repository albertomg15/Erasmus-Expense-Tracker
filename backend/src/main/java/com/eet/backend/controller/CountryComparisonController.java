package com.eet.backend.controller;

import com.eet.backend.dto.CountryComparisonDto;
import com.eet.backend.dto.CountryComparisonResponse;
import com.eet.backend.model.User;
import com.eet.backend.service.CountrySpendingStatsService;
import com.eet.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
