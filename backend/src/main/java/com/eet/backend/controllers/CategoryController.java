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
                .map(c -> new CategoryDto(c.getCategoryId(), c.getName(),c.getEmoji(), c.isDefault()))
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
                .emoji(dto.getEmoji())
                .isDefault(false)
                .build();

        Category saved = categoryService.save(newCategory);
        return ResponseEntity.ok(new CategoryDto(saved.getCategoryId(), saved.getName(), saved.getEmoji(), saved.isDefault()));
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(@RequestParam UUID userId) {
        List<Category> categories = categoryService.getAllAvailableCategories(userId);

        List<CategoryDto> result = categories.stream()
                .map(c -> new CategoryDto(c.getCategoryId(), c.getName(),c.getEmoji(),c.isDefault()))
                .toList();

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable UUID id, @RequestBody CategoryDto dto) {
        Category updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(new CategoryDto(updated.getCategoryId(), updated.getName(), updated.getEmoji(), updated.isDefault()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
        Category category = categoryService.getById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (category.isDefault()) {
            return ResponseEntity.status(403).body("Cannot delete default categories");
        }

        if (categoryService.hasTransactions(id)) {
            return ResponseEntity.status(409).body("Cannot delete category with existing transactions");
        }

        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }



}
