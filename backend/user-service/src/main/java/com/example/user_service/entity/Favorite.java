package com.example.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table( name = "favourites", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "item_id"}) )
public class Favorite {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column( name = "item_id", nullable = false)
    private Long itemId;

}
