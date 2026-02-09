package com.example.apigateway.dto.response;

import com.example.apigateway.dto.serviceResponse.UserServiceBootstrapResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    // auth service login response
    private String token;
    private Long userId;

    // user service get user's watchlist
    private UserServiceBootstrapResponse  userData;
}
