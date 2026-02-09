package com.example.inventory_service.service;

import com.example.inventory_service.dto.response.CategoryResponse;
import com.example.inventory_service.dto.request.CreateUpdateItemRequest;
import com.example.inventory_service.dto.response.ItemPageResponse;
import com.example.inventory_service.dto.response.ItemSummaryResponse;
import com.example.inventory_service.entity.Item;
import com.example.order_service.event.OrderEvent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface InventoryService {

    ItemPageResponse getItemById(Long itemId, Long userId, boolean fetchOtherActiveItems);

    List<ItemSummaryResponse> getAllItemsByUserId(Long userId, boolean onlyActiveItems);

    List<ItemSummaryResponse> getAllOtherActiveItemsForUserId(Long userId, Long excludeItemId);

    List<CategoryResponse> getCategories();

    void createItem(CreateUpdateItemRequest request, List<MultipartFile> itemImages);

    void deleteItem(Long itemId);

    void updateItem(Long itemId, CreateUpdateItemRequest updatedItem, List<MultipartFile> itemImages);

    void updateItemPreference(Long itemId, String preference, String value);

    void updateWatchersCount(Long itemId, int delta);

    void updateItemStatus(Long itemId, String status);

    boolean isItemValid(Item item, OrderEvent event);

    Item findItemById(Long itemId);
}
