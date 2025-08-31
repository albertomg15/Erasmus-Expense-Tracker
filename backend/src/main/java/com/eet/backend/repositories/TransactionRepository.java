package com.eet.backend.repositories;

import com.eet.backend.model.Transaction;
import com.eet.backend.model.TransactionType;
import com.eet.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByUserUserId(UUID userId);

    List<Transaction> findByUser(User user);

    Page<Transaction> findAllByUser(User user, Pageable pageable);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = :type")
    Optional<BigDecimal> sumAmountByUserAndType(@Param("user") User user, @Param("type") TransactionType type);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = com.eet.backend.model.TransactionType.EXPENSE AND t.date BETWEEN :start AND :end")
    Optional<BigDecimal> sumExpensesInDateRange(@Param("user") User user, @Param("start") LocalDate start, @Param("end") LocalDate end);

    boolean existsByCategoryCategoryId(UUID categoryId);

    List<Transaction> findByTrip_TripId(UUID tripId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.userId = :userId AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    Optional<BigDecimal> getTotalSpentByUserAndMonthAndYear(
            @Param("userId") UUID userId,
            @Param("month") int month,
            @Param("year") int year
    );

    List<Transaction> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    List<Transaction> findByUserAndDateAfter(User user, LocalDate startDate);

    List<Transaction> findByUserUserIdAndDateBetween(UUID userId, LocalDate start, LocalDate end);

    List<Transaction> findByUserIdAndTrip_TripIdAndType(UUID userId, UUID tripId, TransactionType type);

    List<Transaction> findByUserAndTypeAndDateBetween(User user, TransactionType transactionType, LocalDate startOfMonth, LocalDate endOfMonth);
}
