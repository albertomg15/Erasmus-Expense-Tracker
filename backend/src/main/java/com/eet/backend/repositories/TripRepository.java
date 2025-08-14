package com.eet.backend.repository;

import com.eet.backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findByUserUserId(UUID userId);


}
