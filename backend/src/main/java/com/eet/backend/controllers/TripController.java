package com.eet.backend.controllers;

import com.eet.backend.dto.TransactionDto;
import com.eet.backend.dto.TripDto;
import com.eet.backend.dto.TripRequestDto;
import com.eet.backend.model.Tag;
import com.eet.backend.model.Transaction;
import com.eet.backend.model.Trip;
import com.eet.backend.model.User;
import com.eet.backend.services.ExchangeRateService;
import com.eet.backend.services.TagService;
import com.eet.backend.services.TripService;
import com.eet.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final UserService userService;
    private final TagService tagService;
    private final ExchangeRateService exchangeRateService;

    @GetMapping("/user/{userId}")
    @PreAuthorize("@authz.isSelf(#userId)")
    public ResponseEntity<List<TripDto>> getByUserId(@PathVariable UUID userId) {
        List<Trip> trips = tripService.getByUserId(userId);
        List<TripDto> tripDtos = trips.stream().map(this::toDto).toList();
        return ResponseEntity.ok(tripDtos);
    }

    @GetMapping("/me")
    public ResponseEntity<List<TripDto>> myTrips(@AuthenticationPrincipal UserDetails ud) {
        var userId = userService.getByEmail(ud.getUsername()).orElseThrow().getUserId();
        var trips = tripService.getByUserId(userId);
        return ResponseEntity.ok(trips.stream().map(this::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getById(@PathVariable UUID id) {
        return tripService.getById(id)
                .map(trip -> ResponseEntity.ok(toDto(trip)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TripDto> create(
            @RequestBody TripRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getUserId();

        User user = userService.getById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = toEntity(dto, user);
        Trip saved = tripService.save(trip);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionDto>> getTripTransactions(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return tripService.getByIdWithTransactions(id)
                .map(trip -> {
                    List<TransactionDto> txs = trip.getTransactions().stream()
                            .map(tx -> toTransactionDto(tx, user))
                            .toList();
                    return ResponseEntity.ok(txs);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private TransactionDto toTransactionDto(Transaction tx, User user) {
        BigDecimal convertedAmount = exchangeRateService.convert(
                tx.getAmount(), tx.getCurrency(), user.getPreferredCurrency());

        return TransactionDto.builder()
                .transactionId(tx.getTransactionId())
                .type(tx.getType().name())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .convertedAmount(convertedAmount)
                .convertedCurrency(user.getPreferredCurrency())
                .categoryName(tx.getCategory().getName())
                .categoryEmoji(tx.getCategory().getEmoji())
                .date(tx.getDate())
                .description(tx.getDescription())
                .tripId(tx.getTrip() != null ? tx.getTrip().getTripId() : null)
                .tripName(tx.getTrip() != null ? tx.getTrip().getName() : null)
                .build();
    }

    private TripDto toDto(Trip trip) {
        return TripDto.builder()
                .tripId(trip.getTripId())
                .name(trip.getName())
                .destination(trip.getDestination())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .estimatedBudget(trip.getEstimatedBudget())
                .notes(trip.getNotes())
                .currency(trip.getCurrency())
                .tags(trip.getTags() != null ? trip.getTags().stream().map(Tag::getName).toList() : List.of())
                .build();
    }

    private Trip toEntity(TripRequestDto dto, User user) {
        return Trip.builder()
                .name(dto.getName())
                .destination(dto.getDestination())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .estimatedBudget(dto.getEstimatedBudget())
                .notes(dto.getNotes())
                .currency(dto.getCurrency())
                .user(user)
                .tags(dto.getTags() != null
                        ? dto.getTags().stream().map(tagName -> tagService.findOrCreate(tagName, user)).toList()
                        : List.of())
                .build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripDto> update(
            @PathVariable UUID id,
            @RequestBody TripRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getUserId();

        Trip existing = tripService.getById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        existing.setName(dto.getName());
        existing.setDestination(dto.getDestination());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setEstimatedBudget(dto.getEstimatedBudget());
        existing.setNotes(dto.getNotes());
        existing.setCurrency(dto.getCurrency());

        User user = userService.getById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getTags() != null) {
            List<Tag> resolved = tagService.findOrCreateAll(dto.getTags(), user);
            if (existing.getTags() == null) {
                existing.setTags(new ArrayList<>(resolved));
            } else {
                existing.getTags().clear();
                existing.getTags().addAll(resolved);
            }
        }

        Trip updated = tripService.save(existing);
        return ResponseEntity.ok(toDto(updated));
    }
}
