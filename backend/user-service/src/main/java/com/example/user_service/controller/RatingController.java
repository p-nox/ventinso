package com.example.user_service.controller;

import com.example.user_service.dto.request.RatingRequest;
import com.example.user_service.dto.response.RatingResponse;
import com.example.user_service.service.implementation.RatingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Ratings", description = "Manage user ratings for orders")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @Operation(summary = "Create rating", description = "Submit a new rating for a completed order")
    public ResponseEntity<Void> createRating(@RequestBody RatingRequest request) {
        ratingService.createRating(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get ratings for user", description = "Retrieve all ratings given to a specific user")
    public ResponseEntity<List<RatingResponse>> getRatingsForUser(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        List<RatingResponse> ratings = ratingService.getRatingsForUser(userId);
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get rating for order", description = "Retrieve the rating associated with a specific order")
    public ResponseEntity<RatingResponse> getRatingForOrder(
            @Parameter(description = "ID of the order") @PathVariable Long orderId) {
        RatingResponse rating = ratingService.getRatingForOrder(orderId);
        return ResponseEntity.ok(rating);
    }
}
