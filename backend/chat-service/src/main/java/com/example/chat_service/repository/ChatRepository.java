package com.example.chat_service.repository;

import com.example.chat_service.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE c.participant1Id = :userId OR c.participant2Id = :userId")
    List<Chat> findAllByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT c FROM Chat c
        WHERE c.itemId = :itemId
          AND ((c.participant1Id = :user1Id AND c.participant2Id = :user2Id)
               OR (c.participant1Id = :user2Id AND c.participant2Id = :user1Id))
    """)
    Optional<Chat> findByParticipantsAndItem(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id,
            @Param("itemId") Long itemId
    );




}
