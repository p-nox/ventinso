package com.example.user_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", updatable = false, nullable = false)
    private Long userId;

    @Builder.Default
    @Column(name = "balance", nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "reserved_balance", nullable = false)
    private BigDecimal reservedBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean canReserve(BigDecimal amount) {
        return balance.compareTo(amount) >= 0;
    }

    public boolean reserveAmount(BigDecimal amount) {
        if (canReserve(amount)) {
            balance = balance.subtract(amount);
            reservedBalance = reservedBalance.add(amount);
            return true;
        }
        return false;
    }

    public void releaseReservedAmount(BigDecimal amount) {
        reservedBalance = reservedBalance.subtract(amount);
        balance = balance.add(amount);
    }

    public void confirmTransfer(BigDecimal amount) {
        reservedBalance = reservedBalance.subtract(amount);
    }
}
