package com.eet.backend.service;

import com.eet.backend.dto.AuthRequest;
import com.eet.backend.dto.AuthResponse;
import com.eet.backend.dto.RegisterRequest;
import com.eet.backend.model.Budget;
import com.eet.backend.model.User;
import com.eet.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final BudgetService budgetService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    LocalDate today = LocalDate.now();

    public AuthResponse register(RegisterRequest request) {
        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .preferredCurrency(request.getPreferredCurrency())
                .language(request.getLanguage())
                .country(request.getCountry())
                .consentToDataAnalysis(false) // explícitamente false
                .build();

        User savedUser = userService.save(newUser);

        String token = jwtService.generateToken(savedUser); // <-- usuario completo
        return new AuthResponse(token);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userService.authenticateAndGetUser(request.getEmail(), request.getPassword());

        if (user == null) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user); // <-- usuario completo
        return new AuthResponse(token);
    }

}
