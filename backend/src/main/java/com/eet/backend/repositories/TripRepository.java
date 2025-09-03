package com.eet.backend.repositories;

import com.eet.backend.model.Trip;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {

    @EntityGraph(attributePaths = {"tags"})
    List<Trip> findByUserUserId(UUID userId);

    @Override
    @EntityGraph(attributePaths = {"tags"})
    Optional<Trip> findById(UUID id);

    @Query("""
           select distinct t
           from Trip t
           left join fetch t.transactions tx
           left join fetch tx.category c
           where t.tripId = :id
           """)
    Optional<Trip> findWithTransactions(@Param("id") UUID id);
}
