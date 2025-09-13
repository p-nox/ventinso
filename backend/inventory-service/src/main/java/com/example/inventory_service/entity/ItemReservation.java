package com.example.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "item_reservations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"item_id", "order_id"}),
        indexes = {
                @Index(name = "idx_item_id", columnList = "item_id"),
                @Index(name = "idx_order_id", columnList = "order_id")
        })

public class ItemReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "order_id", nullable = false, updatable = false)
    private Long orderId;

}
