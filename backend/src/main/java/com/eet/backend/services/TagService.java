package com.eet.backend.services;

import com.eet.backend.model.Tag;
import com.eet.backend.model.User;
import com.eet.backend.repositories.TagRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {

    private final TagRepository tagRepository;

    public List<Tag> findAll() {
        return tagRepository.findAll();
    }

    public Tag findOrCreate(String name, User user) {
        return tagRepository.findByNameAndUser(name, user)
                .orElseGet(() -> tagRepository.save(
                        Tag.builder().name(name).user(user).build()
                ));
    }

    @Transactional
    public List<Tag> findOrCreateAll(Collection<String> names, User user) {
        return names.stream()
                .filter(Objects::nonNull)
                .map(this::normalize)
                .filter(s -> !s.isBlank())
                .distinct() // evita duplicados en la misma petición
                .map(n -> findOrCreate(n, user))
                .toList();
    }

    private String normalize(String s) {
        return s == null ? null : s.trim(); // si quieres, añade `.toLowerCase(Locale.ROOT)`
    }

    public List<Tag> findByUserId(UUID userId) {
        return tagRepository.findByUserUserId(userId);
    }


    public Tag update(UUID id, String newName) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        tag.setName(newName);
        return tagRepository.save(tag);
    }

    public void delete(UUID id) {
        tagRepository.deleteById(id); // Si hay FK con Trip, esto puede lanzar excepción
    }

}

