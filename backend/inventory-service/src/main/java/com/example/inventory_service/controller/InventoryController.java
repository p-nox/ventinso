package com.example.inventory_service.controller;

import com.example.inventory_service.dto.request.CreateUpdateItemRequest;
import com.example.inventory_service.dto.response.CategoryResponse;
import com.example.inventory_service.dto.response.ItemPageResponse;
import com.example.inventory_service.dto.response.ItemSummaryResponse;
import com.example.inventory_service.service.InventoryService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/inventory")
@AllArgsConstructor
@Slf4j
@Tag(name = "Inventory", description = "Manage items, categories, status and preferences")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{itemId}")
    @Operation(summary = "Get item by ID", description = "Retrieve detailed information of a specific item, " +
            "can include other items of the owner")
    public ResponseEntity<ItemPageResponse> getItemById(
            @Parameter(description = "ID of the item") @PathVariable Long itemId,
            @Parameter(description = "ID of the user") @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "false") boolean fetchOtherActiveItems ) {

        return ResponseEntity.ok(inventoryService.getItemById(itemId, userId, fetchOtherActiveItems));
    }

    @GetMapping("/{userId}/items")
    @Operation(summary = "Get item by ID", description = "Retrieve all items of a specific userId," +
            "may include hidden items if the requested userId is the owner of user profile")
    public ResponseEntity<List<ItemSummaryResponse>> getAllItemsByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) boolean includeHiddenItems) {
        return ResponseEntity.ok(inventoryService.getAllItemsByUserId(userId, includeHiddenItems));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get categories", description = "Retrieve the list of available item categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(inventoryService.getCategories());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create new item", description = "Add a new item with details and images")
    public ResponseEntity<String> createItem(
            @ModelAttribute CreateUpdateItemRequest request,
            @Parameter(description = "List of item images") @RequestParam(value = "files") List<MultipartFile> itemImages
    ) {
        try {
            inventoryService.createItem(request, itemImages);
            return ResponseEntity.status(HttpStatus.CREATED).body("Item added!");
        } catch (Exception e) {
            log.error("Failed to create item:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create item: " + e.getMessage());
        }
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Delete item", description = "Remove an item from inventory by ID")
    public ResponseEntity<Void> deleteItem(
            @Parameter(description = "ID of the item to delete") @PathVariable Long itemId) {
        inventoryService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update item", description = "Update an item's details and optionally its images")
    public ResponseEntity<Void> updateItem(
            @Parameter(description = "ID of the item") @PathVariable Long itemId,
            @ModelAttribute CreateUpdateItemRequest request,
            @Parameter(description = "Updated item images") @RequestParam(name = "files", required = false) List<MultipartFile> itemImages) {
        inventoryService.updateItem(itemId, request, itemImages);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{itemId}/status/{status}")
    @Operation(summary = "Update item status", description = "Change the status of an item (e.g. ACTIVE, SOLD, HIDDEN)")
    public ResponseEntity<Void> updateStatus(
            @Parameter(description = "ID of the item") @PathVariable Long itemId,
            @Parameter(description = "New status value") @PathVariable String status) {
        inventoryService.updateItemStatus(itemId, status);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{itemId}/preferences/{preference}")
    @Operation(summary = "Update item preference", description = "Update a specific preference of an item (e.g. visibility, open to offers option)")
    public ResponseEntity<Void> updateItemPreference(
            @Parameter(description = "ID of the item") @PathVariable Long itemId,
            @Parameter(description = "Preference field to update") @PathVariable String preference,
            @Parameter(description = "New preference value") @RequestParam String value) {
        inventoryService.updateItemPreference(itemId, preference, value);
        return ResponseEntity.ok().build();
    }
}
