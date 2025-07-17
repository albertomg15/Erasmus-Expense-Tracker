package com.eet.backend.controller;

import com.eet.backend.model.Trip;
import com.eet.backend.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Trip>> getByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(tripService.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getById(@PathVariable UUID id) {
        Optional<Trip> trip = tripService.getById(id);
        return trip.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Trip> create(@RequestBody Trip trip) {
        Trip savedTrip = tripService.save(trip);
        return ResponseEntity.ok(savedTrip);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
