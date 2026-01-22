package com.example.chat_service.repository;

import com.example.chat_service.entity.Chat;
import com.example.chat_service.entity.Message;
import com.example.chat_service.enums.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {


    List<Message> findAllByChatIdOrderByTimestampAsc(Long chatId);

    @Modifying
    @Query("UPDATE Message m SET m.isReadByReceiver = true " +
            "WHERE m.chat.id = :chatId AND m.senderId <> :userId AND m.isReadByReceiver = false")
    void markMessagesAsRead(@Param("chatId") Long chatId, @Param("userId") Long userId);


    Optional<Message> findFirstByChatAndMessageTypeOrderByTimestampDesc(Chat chat, MessageType type);
}