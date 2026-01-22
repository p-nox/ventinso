package com.example.chat_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSnapshot {

    @Id
    private Long userId;

    @Column(nullable = false)
    private String avatarUrl;
}
