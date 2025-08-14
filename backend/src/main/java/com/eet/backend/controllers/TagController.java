package com.eet.backend.controller;

import com.eet.backend.dto.TagDto;
import com.eet.backend.model.Tag;
import com.eet.backend.model.User;
import com.eet.backend.service.TagService;
import com.eet.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final UserService userService;

    // 🔹 GET: listar tags
    @GetMapping
    public ResponseEntity<List<TagDto>> getAll(@RequestParam UUID userId) {
        List<TagDto> tagDtos = tagService.findByUserId(userId).stream()
                .map(tag -> new TagDto(tag.getTagId(), tag.getName()))
                .toList();
        return ResponseEntity.ok(tagDtos);
    }

    // 🔹 POST: crear tag
    @PostMapping
    public ResponseEntity<TagDto> create(@RequestBody Tag tag, @RequestParam UUID userId) {
        User user = userService.getById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Tag created = tagService.findOrCreate(tag.getName(), user);
        return ResponseEntity.ok(new TagDto(created.getTagId(), created.getName()));
    }

    // 🔹 PUT: actualizar tag
    @PutMapping("/{id}")
    public ResponseEntity<TagDto> update(@PathVariable UUID id, @RequestBody Tag tag) {
        Tag updated = tagService.update(id, tag.getName());
        return ResponseEntity.ok(new TagDto(updated.getTagId(), updated.getName()));
    }

    // 🔹 DELETE: eliminar tag
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            tagService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(409).body("Cannot delete tag: it is likely in use by trips.");
        }
    }
}
