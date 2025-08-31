package com.eet.backend.services;

import com.eet.backend.dto.UserResponse;
import com.eet.backend.model.User;
import com.eet.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User register(String email, String password, String preferredCurrency, String language) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email ya registrado");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .preferredCurrency(preferredCurrency)
                .language(language)
                .build();

        return userRepository.save(user);
    }


    public UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setUserId(u.getUserId());
        r.setEmail(u.getEmail());
        r.setPreferredCurrency(u.getPreferredCurrency());
        r.setLanguage(u.getLanguage());
        r.setCountry(u.getCountry());
        r.setConsentToDataAnalysis(u.getConsentToDataAnalysis());
        return r;
    }

    public boolean authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPasswordHash());
    }

    public Optional<User> getById(UUID userId) {
        return userRepository.findById(userId);
    }
    public User authenticateAndGetUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user != null && passwordEncoder.matches(password, user.getPasswordHash())) {
            return user;
        }

        return null;
    }

    public User updatePreferences(UUID userId, String currency, String language) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        user.setPreferredCurrency(currency);
        user.setLanguage(language);

        return userRepository.save(user);
    }


// ...

    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("La contraseña actual no es correcta.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
