package com.example.auth_service.event;

import com.example.user_service.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NewUserEvent {
    private Long userId;
    private String name;
    private String username;
    private String email;
    private UserStatus status;
    private LocalDateTime registeredAt;
}
