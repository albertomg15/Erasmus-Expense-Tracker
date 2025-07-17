package com.eet.backend.service;

import com.eet.backend.dto.AuthRequest;
import com.eet.backend.dto.AuthResponse;
import com.eet.backend.dto.RegisterRequest;
import com.eet.backend.model.User;
import com.eet.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        User user = userService.register(
                request.getEmail(),
                request.getPassword(),
                request.getPreferredCurrency(),
                request.getLanguage()
        );

        String token = jwtService.generateToken(user); // <-- usuario completo
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
