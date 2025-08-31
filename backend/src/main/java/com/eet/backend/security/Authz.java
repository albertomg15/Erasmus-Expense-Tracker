// Authz.java
package com.eet.backend.security;

import com.eet.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class Authz {
    private final UserService userService;

    public boolean isSelf(UUID userId) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        var email = auth.getName(); // <- tu JwtAuthFilter pone aquí el email
        return userService.getByEmail(email)
                .map(u -> u.getUserId().equals(userId))
                .orElse(false);
    }
}
