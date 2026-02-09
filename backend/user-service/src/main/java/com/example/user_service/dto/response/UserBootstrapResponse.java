package com.example.user_service.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(
        name = "UserBootstrapResponse",
        description = "Minimal user identity data for authentication bootstrap"
)
public class UserBootstrapResponse {

    private String username;

    private String avatarUrl;

    private List<FavoriteResponse> watchlist;
}
