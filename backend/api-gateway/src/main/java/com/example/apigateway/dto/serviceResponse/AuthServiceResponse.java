package com.example.apigateway.dto.serviceResponse;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthServiceResponse {
    private String token;
    private Long userId;
}

