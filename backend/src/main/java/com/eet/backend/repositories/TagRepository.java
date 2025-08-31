package com.eet.backend.repositories;

import com.eet.backend.model.Tag;
import com.eet.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findByNameAndUser(String name, User user);

    List<Tag> findByUserUserId(UUID userId);
}

