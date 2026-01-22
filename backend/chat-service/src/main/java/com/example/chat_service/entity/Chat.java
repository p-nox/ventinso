package com.example.chat_service.entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@RequiredArgsConstructor
@Table(name = "chat_messages", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"participant1_id", "participant2_id", "item_id"})
})
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @Column(name = "participant1_id", nullable = false)
    private Long participant1Id;

    @NonNull
    @Column(name = "participant2_id", nullable = false)
    private Long participant2Id;

    @NonNull
    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "last_message_id")
    private Long lastMessageId;

    @Column(nullable = false)
    private boolean participant1Left = false;

    @Column(nullable = false)
    private boolean participant2Left = false;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

}
