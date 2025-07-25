package com.eet.backend.service;

import com.eet.backend.dto.TripDto;
import com.eet.backend.dto.TripRequestDto;
import com.eet.backend.model.Tag;
import com.eet.backend.model.Trip;
import com.eet.backend.model.User;
import com.eet.backend.repository.TripRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.AssertTrue;
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

    private final TagService tagService;

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

    public TripDto toDto(Trip trip) {
        return TripDto.builder()
                .tripId(trip.getTripId())
                .name(trip.getName())
                .destination(trip.getDestination())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .estimatedBudget(trip.getEstimatedBudget())
                .notes(trip.getNotes())
                .tags(
                        trip.getTags() != null
                                ? trip.getTags().stream()
                                .map(tag -> tag.getName())
                                .toList()
                                : List.of()
                )
                .currency(trip.getCurrency())
                .build();
    }

    public Trip toEntity(TripRequestDto dto, User user) {
        List<Tag> tagEntities = dto.getTags().stream()
                .map(tagName -> tagService.findOrCreate(tagName, user))
                .toList();

        return Trip.builder()
                .name(dto.getName())
                .destination(dto.getDestination())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .estimatedBudget(dto.getEstimatedBudget())
                .notes(dto.getNotes())
                .currency(dto.getCurrency()) // si lo has añadido
                .user(user)
                .tags(tagEntities)
                .build();
    }
}
