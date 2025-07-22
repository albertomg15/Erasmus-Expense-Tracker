package com.eet.backend.service;

import com.eet.backend.model.Category;
import com.eet.backend.model.User;
import com.eet.backend.repository.CategoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

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
}
