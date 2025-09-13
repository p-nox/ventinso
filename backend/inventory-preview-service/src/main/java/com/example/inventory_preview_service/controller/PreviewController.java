package com.example.inventory_preview_service.controller;

import com.example.inventory_preview_service.dto.ItemCardResponse;
import com.example.inventory_preview_service.entity.ItemPreview;
import com.example.inventory_preview_service.service.PreviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/preview")
@AllArgsConstructor
@Slf4j
@Tag(name = "Preview", description = "Preview items for search, latest listings, and user items")
public class PreviewController {

    private final PreviewService previewService;

    @GetMapping("/user/{userId}")
    @Operation(
            summary = "Get all items by user",
            description = "Retrieve all items posted by a specific user, with option to include hidden items"
    )
    public ResponseEntity<List<ItemCardResponse>> getAllItemsByUserId(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Include hidden items") @RequestParam(defaultValue = "false") Boolean includeHidden) {

        List<ItemCardResponse> items = previewService.getItemsByUserId(userId, includeHidden);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/latest")
    @Operation(
            summary = "Get latest items",
            description = "Retrieve the latest items added to the platform with pagination"
    )
    public ResponseEntity<List<ItemCardResponse>> getLatestItems(
            @Parameter(description = "Number of items to fetch") @RequestParam("limit") int limit,
            @Parameter(description = "Offset for pagination") @RequestParam(value = "offset", defaultValue = "0") int offset) {

        List<ItemCardResponse> response = previewService.getLatestItems(limit, offset);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search items with filters",
            description = "Search items by text, category, type, condition, price range, and limit"
    )
    public ResponseEntity<List<ItemCardResponse>> getItemsByFilters(
            @Parameter(description = "Free-text query") @RequestParam(required = false) String q,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Type filter") @RequestParam(required = false) String type,
            @Parameter(description = "Condition filter") @RequestParam(required = false) String condition,
            @Parameter(description = "Minimum price") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "Max number of results to return") @RequestParam(defaultValue = "20") int limit) {

        log.info("Fetching items with filters: q='{}', category='{}', type='{}', condition='{}', minPrice={}, maxPrice={}, limit={}",
                q, category, type, condition, minPrice, maxPrice, limit);

        List<ItemCardResponse> items = previewService.getItemsByFilters(
                q, category, type, condition, minPrice, maxPrice, limit);
        return ResponseEntity.ok(items);
    }
}
