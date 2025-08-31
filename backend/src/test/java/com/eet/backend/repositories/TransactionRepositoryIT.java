package com.eet.backend.repositories;

import com.eet.backend.model.Transaction;
import com.eet.backend.model.TransactionType;
import com.eet.backend.model.User;
// ⬆️ Ajusta imports a tus paquetes reales (model(s)/repository)

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class TransactionRepositoryIT {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private TransactionRepository transactionRepository; // ⬅️ Ajusta el nombre del repo

    @Test
    void save_and_findAll_persistsMappingCorrectly() {
        // 1) Usuario
        User user = new User();
        user.setEmail("repo@test.com");
        user.setPasswordHash("{noop}x");
        em.persist(user);

        // 2) Transacción
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(new BigDecimal("25.00"));
        tx.setCurrency("EUR");
        tx.setType(TransactionType.EXPENSE);
        tx.setDescription("Coffee");
        tx.setDate(LocalDate.now());

        em.persistAndFlush(tx);

        // 3) Verificaciones básicas del mapping/JPA
        List<Transaction> all = transactionRepository.findAll();
        assertEquals(1, all.size());
        Transaction saved = all.get(0);

        assertNotNull(saved.getTransactionId()); // ajusta si tu ID se llama distinto (p.ej. getId)
        assertEquals("Coffee", saved.getDescription());
        assertEquals("EUR", saved.getCurrency());
        assertEquals(TransactionType.EXPENSE, saved.getType());
        assertEquals(user.getUserId(), saved.getUser().getUserId());
    }
}
