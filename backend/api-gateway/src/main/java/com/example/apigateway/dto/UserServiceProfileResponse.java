package com.example.apigateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserServiceProfileResponse {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String avatarUrl;
    private LocalDateTime registeredAt;
}
