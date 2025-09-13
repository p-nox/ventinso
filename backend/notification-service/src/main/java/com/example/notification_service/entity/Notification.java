package com.example.notification_service.entity;

import com.example.notification_service.enums.EventAction;
import com.example.notification_service.enums.NotificationType;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Notification {

    @Id
    private String id;

    @Field("user_id")
    private Long userId;

    @Field("item_id")
    private Long itemId;

    @Field("message")
    private String message;

    @Field("type")
    private NotificationType type;

    @Field("action")
    private EventAction action;

    @Field("is_read")
    private Boolean isRead = false;

    @Field("redirect_url")
    private String redirectUrl;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}