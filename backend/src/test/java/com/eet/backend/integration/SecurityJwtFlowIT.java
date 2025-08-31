package com.eet.backend.integration;


import com.eet.backend.model.User;
import com.eet.backend.repositories.UserRepository;
import com.eet.erasmusexpensetracker.support.TestJwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifica que:
 *  - Sin Authorization -> 401 en rutas protegidas
 *  - Con JWT válido (sub=email, claim userId) -> 200
 * Pasa por JwtAuthFilter real, JwtService real y CustomUserDetailsService real.
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource("classpath:application-test.properties")
class SecurityJwtFlowIT {

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository userRepository;

    @Value("${security.jwt.secret}")
    private String secret;

    private String email;
    private String userId;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        // Crea un usuario que pueda cargar CustomUserDetailsService por email
        User u = new User();
        u.setUserId(UUID.randomUUID());
        u.setEmail("test.user@example.com");
        // Si tu UserDetailsService valida password hash, no afecta a GET protegidos
        u.setPasswordHash("{noop}irrelevant"); // o cualquier hash si tu encoder lo requiere
        // Si tu User tiene roles/authorities, setéalos aquí.
        userRepository.save(u);

        email = u.getEmail();
        userId = u.getUserId().toString();
    }

    @Test
    void securedEndpoint_withoutToken_returns401() throws Exception {
        // Ajusta la URL a un endpoint protegido real de tu app
        mvc.perform(get("/api/transactions/summary"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void securedEndpoint_withValidJwt_returns200() throws Exception {
        String token = TestJwtUtil.generateForEmail(
                email,                  // subject = email (para extractUsername)
                userId,                 // claim userId (para frontend)
                secret,                 // misma secret que en application-test.properties
                3_600_000L              // 1h
        );

        mvc.perform(get("/api/transactions/summary")
                        .header("Authorization", TestJwtUtil.bearer(token)))
                .andExpect(status().isOk());
    }
}

