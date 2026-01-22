package com.example.chat_service.entity;

import com.example.chat_service.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private boolean isReadByReceiver = false;

    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType; // TEXT, IMAGE, VIDEO

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
