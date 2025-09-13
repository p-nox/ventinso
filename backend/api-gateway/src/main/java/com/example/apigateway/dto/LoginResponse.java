package com.example.apigateway.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    // auth service login response
    private String token;
    private Long userId;

    // user service get user's watchlist
    private List<UserServiceWatchlistResponse> watchlist;
}
