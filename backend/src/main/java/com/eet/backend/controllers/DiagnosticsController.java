package com.eet.backend.controllers;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/diag") // pasa por el filtro JWT
public class DiagnosticsController {

    @GetMapping("/whoami")
    public Map<String,Object> who(@AuthenticationPrincipal Object principal) {
        var a = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        return Map.of(
                "principal", principal == null ? null : principal.toString(),
                "authName", a == null ? null : a.getName(),
                "authClass", a == null ? null : a.getClass().getName(),
                "authenticated", a != null && a.isAuthenticated()
        );
    }
}

