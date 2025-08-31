package com.eet.backend.services;

import com.eet.backend.dto.CategoryDto;
import com.eet.backend.model.Category;
import com.eet.backend.repositories.CategoryRepository;
import com.eet.backend.repositories.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public List<Category> getCategoriesByUserId(UUID userId) {
        return categoryRepository.findByUserUserId(userId);
    }

    public List<Category> getAllAvailableCategories(UUID userId) {
        return categoryRepository.findByUserUserIdOrUserIsNull(userId);
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    public void delete(UUID categoryId) {
        categoryRepository.deleteById(categoryId);
    }

    public Category updateCategory(UUID id, CategoryDto dto) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (existing.isDefault()) {
            throw new RuntimeException("Default categories cannot be edited");
        }
        existing.setName(dto.getName());
        existing.setEmoji(dto.getEmoji());
        return categoryRepository.save(existing);
    }
    public Optional<Category> getById(UUID id) {
        return categoryRepository.findById(id);
    }

    public boolean hasTransactions(UUID categoryId) {
        return transactionRepository.existsByCategoryCategoryId(categoryId);
    }
}
