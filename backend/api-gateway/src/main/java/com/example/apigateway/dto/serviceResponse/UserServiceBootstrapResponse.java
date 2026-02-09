package com.example.apigateway.dto.serviceResponse;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserServiceBootstrapResponse {

    private String username;
    private String avatarUrl;
    private List<FavoriteResponse> watchlist;

}
