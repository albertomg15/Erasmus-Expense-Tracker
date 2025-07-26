package com.eet.backend.controller;

import com.eet.backend.dto.TransactionDto;
import com.eet.backend.dto.TripDto;
import com.eet.backend.dto.TripRequestDto;
import com.eet.backend.model.Transaction;
import com.eet.backend.model.Trip;
import com.eet.backend.model.User;
import com.eet.backend.service.ExchangeRateService;
import com.eet.backend.service.TagService;
import com.eet.backend.service.TripService;
import com.eet.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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


    // 🔹 Obtener todos los viajes de un usuario (convertidos a DTO)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TripDto>> getByUserId(@PathVariable UUID userId) {
        List<Trip> trips = tripService.getByUserId(userId);
        List<TripDto> tripDtos = trips.stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(tripDtos);
    }

    // 🔹 Obtener un viaje por ID
    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getById(@PathVariable UUID id) {
        return tripService.getById(id)
                .map(trip -> ResponseEntity.ok(toDto(trip)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Crear nuevo viaje con tags y usuario
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


    // 🔹 Eliminar un viaje por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }



    // ...
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionDto>> getTripTransactions(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return tripService.getById(id)
                .map(trip -> {
                    List<TransactionDto> txs = trip.getTransactions().stream()
                            .map(tx -> toTransactionDto(tx, user)) // ✅
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



    // 🔁 Método auxiliar: convertir de entidad a DTO
    private TripDto toDto(Trip trip) {
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
                                ? trip.getTags().stream().map(tag -> tag.getName()).toList()
                                : List.of()
                )
                .build();
    }

    // 🔁 Método auxiliar: convertir de DTO a entidad
    private Trip toEntity(TripRequestDto dto, User user) {
        return Trip.builder()
                .name(dto.getName())
                .destination(dto.getDestination())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .estimatedBudget(dto.getEstimatedBudget())
                .notes(dto.getNotes())
                .currency(dto.getCurrency()) // ← si ya lo añadiste
                .user(user)
                .tags(
                        dto.getTags() != null
                                ? dto.getTags().stream()
                                .map(tagName -> tagService.findOrCreate(tagName, user))
                                .toList()
                                : List.of()
                )
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

        System.out.println("Trip owner: " + existing.getUser().getUserId());
        System.out.println("Requesting user: " + userId);
        System.out.println("JWT userId: " + userId);
        System.out.println("Trip owner userId: " + existing.getUser().getUserId());
        System.out.println("User equals: " + userId.equals(existing.getUser().getUserId()));
        System.out.println("UserDetails username: " + userDetails.getUsername());


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
            existing.setTags(
                    dto.getTags().stream()
                            .map(tagName -> tagService.findOrCreate(tagName, user))
                            .toList()
            );
        }

        Trip updated = tripService.save(existing);
        return ResponseEntity.ok(toDto(updated));
    }


}
