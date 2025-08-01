package com.eet.backend.controller;

import com.eet.backend.dto.AuthRequest;
import com.eet.backend.dto.AuthResponse;
import com.eet.backend.dto.RegisterRequest;
import com.eet.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        System.out.println("Ping recibido");
        return ResponseEntity.ok("pong");
    }

}
