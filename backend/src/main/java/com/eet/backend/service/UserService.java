package com.eet.backend.service;

import com.eet.backend.model.User;
import com.eet.backend.repository.UserRepository;
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


}
