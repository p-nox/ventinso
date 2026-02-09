package com.example.apigateway.dto.response;

import com.example.apigateway.dto.serviceResponse.InventoryServiceResponse;
import com.example.apigateway.dto.serviceResponse.UserServiceResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {

    // UserServiceResponse
    private UserServiceResponse user;
    private int totalItems;
    private int totalActiveItems;
    private int totalHiddenItems;

    // InventoryServiceResponse
    private List<InventoryServiceResponse.ItemSummaryResponse> userItems;
}
