package com.example.apigateway.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreviewServiceResponse {
    private String itemId;
    private String title;
    private BigDecimal price;
    private String condition;
    private String type;
    private String status;
    private Long userId;
    private String username;
    private Double avgOverallRating;
    private Integer totalRatings;
    private String category;
    private String thumbnailUrl;
}
