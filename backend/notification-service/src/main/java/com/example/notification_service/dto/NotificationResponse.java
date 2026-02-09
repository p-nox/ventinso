package com.example.notification_service.dto;

import com.example.notification_service.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationResponse {
    private String message;
    private String redirectUrl;
    private NotificationType type;
    private LocalDateTime createdAt;
    private String thumbnail;
    private Boolean isRead;
    private String id;
    private Long userId;
}

