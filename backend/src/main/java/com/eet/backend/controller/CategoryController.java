package com.eet.backend.controller;

import com.eet.backend.dto.CategoryDto;
import com.eet.backend.model.Category;
import com.eet.backend.model.User;
import com.eet.backend.service.CategoryService;
import com.eet.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final UserService userService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CategoryDto>> getCategoriesByUser(@PathVariable UUID userId) {
        List<CategoryDto> categories = categoryService.getCategoriesByUserId(userId)
                .stream()
                .map(c -> new CategoryDto(c.getCategoryId(), c.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto dto, @RequestParam UUID userId) {
        User user = userService.getById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Category newCategory = Category.builder()
                .name(dto.getName())
                .user(user)
                .isDefault(false)
                .build();

        Category saved = categoryService.save(newCategory);
        return ResponseEntity.ok(new CategoryDto(saved.getCategoryId(), saved.getName()));
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(@RequestParam UUID userId) {
        List<Category> categories = categoryService.getAllAvailableCategories(userId);

        List<CategoryDto> result = categories.stream()
                .map(c -> new CategoryDto(c.getCategoryId(), c.getName()))
                .toList();

        return ResponseEntity.ok(result);
    }
}
