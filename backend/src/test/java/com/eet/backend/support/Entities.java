package com.eet.backend.support;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

// Ajusta estos imports al paquete real de tus entidades/enums:
import com.eet.backend.model.User;
import com.eet.backend.model.Category;
import com.eet.backend.model.Trip;
import com.eet.backend.model.Transaction;
import com.eet.backend.model.RecurringTransaction;
import com.eet.backend.model.TransactionType;
import com.eet.backend.model.RecurrencePattern;

/**
 * Factory helpers para crear entidades de forma concisa en tests.
 * No usa Lombok; setters explícitos para máxima compatibilidad.
 */
public final class Entities {

    private Entities() {}

    // ======= User =======
    public static User user(String email) {
        User u = new User();
        // Si tu entidad genera el UUID en @PrePersist, puedes omitirlo.
        setIfPresent(() -> u.setUserId(UUID.randomUUID()));
        u.setEmail(email);
        u.setPasswordHash("dummy-hash");
        u.setPreferredCurrency("EUR"); // si tu modelo lo tiene
        return u;
    }

    // ======= Category =======
    public static Category category(User owner, String name) {
        return category(owner, name, null);
    }

    public static Category category(User owner, String name, String emoji) {
        Category c = new Category();
        setIfPresent(() -> c.setCategoryId(UUID.randomUUID()));
        c.setUser(owner);
        c.setName(name);
        if (hasSetter(() -> c.setEmoji(null)) && emoji != null) {
            c.setEmoji(emoji);
        }
        c.setDefault(false); // si existe en tu modelo
        return c;
    }

    // ======= Trip =======
    public static Trip trip(User owner, String name) {
        Trip t = new Trip();
        setIfPresent(() -> t.setTripId(UUID.randomUUID()));
        t.setUser(owner);
        t.setName(name);
        t.setDestination("Testland");
        t.setCurrency("EUR");
        t.setStartDate(LocalDate.now().minusDays(3));
        t.setEndDate(LocalDate.now().plusDays(4));
        return t;
    }

    // ======= Transaction =======
    public static Transaction income(User owner, BigDecimal amount) {
        return transaction(owner, amount, "EUR", TransactionType.INCOME, "Test income", LocalDate.now(), null, null);
    }

    public static Transaction expense(User owner, BigDecimal amount) {
        return transaction(owner, amount, "EUR", TransactionType.EXPENSE, "Test expense", LocalDate.now(), null, null);
    }

    public static Transaction transaction(
            User owner,
            BigDecimal amount,
            String currency,
            TransactionType type,
            String description,
            LocalDate date,
            Category category,
            Trip trip
    ) {
        Transaction tx = new Transaction();
        setIfPresent(() -> tx.setTransactionId(UUID.randomUUID()));
        tx.setUser(owner);
        tx.setAmount(amount);
        tx.setCurrency(currency);
        tx.setType(type);
        tx.setDescription(description);
        tx.setDate(date);
        if (category != null) tx.setCategory(category);
        if (trip != null) tx.setTrip(trip);

        // Campos opcionales que tu DTO/Entidad pueda tener
        if (hasSetter(() -> tx.setAmount(null))) {
            tx.setAmount(null);
        }
        if (hasSetter(() -> tx.setCurrency(null))) {
            tx.setCurrency(null);
        }
        return tx;
    }

    // ======= RecurringTransaction =======
    public static RecurringTransaction recurringExpense(
            User owner,
            BigDecimal amount,
            RecurrencePattern pattern,
            LocalDate startDate
    ) {
        RecurringTransaction r = new RecurringTransaction();
        setIfPresent(() -> r.setTransactionId(UUID.randomUUID()));
        r.setUser(owner);
        r.setAmount(amount);
        r.setCurrency("EUR");
        r.setType(TransactionType.EXPENSE);
        r.setDescription("Recurring expense");
        r.setDate(startDate);
        r.setRecurrencePattern(pattern);
        if (hasSetter(() -> r.setNextExecution((LocalDate) null))) {
            r.setNextExecution(LocalDate.from(startDate.plusDays(1).atStartOfDay()));
        }
        if (hasSetter(() -> r.setActive(false))) {
            r.setActive(true);
        }
        return r;
    }

    // ======= Helpers para evitar NoSuchMethodError si algún setter no existe =======
    private static void setIfPresent(Runnable r) {
        try { r.run(); } catch (Throwable ignored) {}
    }

    /**
     * Intenta ejecutar un setter "vacío" en tiempo de test, solo para comprobar si existe.
     * Si no existe, captura la excepción y devuelve false.
     */
    private static boolean hasSetter(Runnable setterProbe) {
        try {
            setterProbe.run();
            return true;
        } catch (Throwable ex) {
            return false;
        }
    }
}
