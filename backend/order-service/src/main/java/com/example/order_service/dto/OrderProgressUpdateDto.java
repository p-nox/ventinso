package com.example.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderProgressUpdateDto {
    private Long id;
    private String status;
    private String trackingNumber;
    private LocalDateTime sentAt;
    private LocalDateTime arrivedAt;
}
