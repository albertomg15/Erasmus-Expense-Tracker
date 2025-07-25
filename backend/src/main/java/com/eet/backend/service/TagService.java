package com.eet.backend.service;

import com.eet.backend.model.Tag;
import com.eet.backend.model.User;
import com.eet.backend.repository.TagRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
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

