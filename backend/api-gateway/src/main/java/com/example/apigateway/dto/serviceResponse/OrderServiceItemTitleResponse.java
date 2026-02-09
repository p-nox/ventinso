package com.example.apigateway.dto.serviceResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderServiceItemTitleResponse {
    private Long orderId;
    private String itemTitle;
}
