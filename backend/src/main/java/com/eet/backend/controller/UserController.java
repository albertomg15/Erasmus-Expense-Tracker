package com.eet.backend.controller;

import com.eet.backend.dto.ChangePasswordRequest;
import com.eet.backend.dto.UserProfileUpdateDto;
import com.eet.backend.model.User;
import com.eet.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        userService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.getByEmail(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



    @PutMapping
    public ResponseEntity<User> updateUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid UserProfileUpdateDto dto
    ) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPreferredCurrency(dto.getPreferredCurrency());
        user.setLanguage(dto.getLanguage());
        user.setCountry(dto.getCountry());
        user.setConsentToDataAnalysis(dto.isConsentToDataAnalysis());

        return ResponseEntity.ok(userService.save(user));
    }

}


