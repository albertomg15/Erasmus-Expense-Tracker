package com.eet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "budget_id", updatable = false, nullable = false)
    private UUID budgetId;

    private Integer month;

    private Integer year;

    @Column(name = "max_spending", nullable = false, precision = 19, scale = 4)
    private BigDecimal maxSpending;

    @Column(name = "warning_threshold", precision = 19, scale = 4)
    private BigDecimal warningThreshold;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
}

