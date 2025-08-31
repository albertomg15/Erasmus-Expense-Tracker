package com.eet.backend.services;

import com.eet.backend.dto.AuthRequest;          // ⬅️ Ajusta paquete
import com.eet.backend.model.User;                   // ⬅️ Ajusta paquete
import com.eet.backend.repositories.UserRepository;    // ⬅️ Ajusta paquete
import com.eet.backend.security.JwtService;          // ⬅️ Ajusta paquete

import com.eet.backend.services.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;

    @InjectMocks private AuthService authService; // ⬅️ Tu servicio real

    @Test
    void login_withValidCredentials_returnsJwt() {
        // Arrange
        String email = "test@example.com";
        String raw = "password";
        AuthRequest req = new AuthRequest();
        req.setEmail(email);
        req.setPassword(raw);

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("ENC");  // lo que tengas en tu entidad

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(raw, "ENC")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("eyJ.mock.token");

        var resp = authService.login(req);
        assertNotNull(resp);
        assertNotNull(resp.getToken());
        assertTrue(resp.getToken().startsWith("eyJ"));

        verify(jwtService).generateToken(user);
    }

    @Test
    void login_withWrongPassword_throwsBadCredentials() {
        String email = "a@b.com";
        AuthRequest req = new AuthRequest();
        req.setEmail(email);
        req.setPassword("bad");

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("ENC");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad", "ENC")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_userNotFound_throwsBadCredentials() {
        AuthRequest req = new AuthRequest();
        req.setEmail("missing@x.com");
        req.setPassword("pass");

        when(userRepository.findByEmail("missing@x.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
        verifyNoInteractions(jwtService);
    }
}
