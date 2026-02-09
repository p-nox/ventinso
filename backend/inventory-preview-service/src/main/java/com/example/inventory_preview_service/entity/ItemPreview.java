package com.example.inventory_preview_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@Builder
@AllArgsConstructor
@Document(collection = "item_previews")
public class ItemPreview {

    @Id
    private String itemId;

    @TextIndexed
    private String title;

    @TextIndexed
    private String description;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal price;

    private String condition; // New-Used-Like new....

    private String status;  // Active-sold-hidden...

    private String type;    // Buy, Sell

    @Builder.Default
    private Long watchers = 0L;

    @TextIndexed
    private String category;

    private Long views;

    private String thumbnailUrl;

    private LocalDateTime createdAt;

    private String username;

    private Double avgOverallRating;

    private Integer totalRatings;

    private Long userId;

    private Boolean openToOffers;

    private Boolean pickUpByAppointment;
}
