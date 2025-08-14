package com.eet.backend.repository;

import com.eet.backend.model.Category;
import com.eet.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByUser(User user);
    List<Category> findByUserUserId(UUID userId);
    List<Category> findByUserUserIdOrUserIsNull(UUID userId);
}
