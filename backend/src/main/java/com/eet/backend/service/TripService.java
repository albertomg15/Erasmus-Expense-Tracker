package com.eet.backend.service;

import com.eet.backend.model.Trip;
import com.eet.backend.repository.TripRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TripService {

    private final TripRepository tripRepository;

    public List<Trip> getByUserId(UUID userId) {
        return tripRepository.findByUserUserId(userId);
    }

    public Optional<Trip> getById(UUID id) {
        return tripRepository.findById(id);
    }

    public Trip save(Trip trip) {
        return tripRepository.save(trip);
    }

    public void delete(UUID id) {
        tripRepository.deleteById(id);
    }
}
