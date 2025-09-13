package com.example.inventory_service.service;

import com.example.inventory_service.dto.CategoryResponse;
import com.example.inventory_service.dto.CreateUpdateItemRequest;
import com.example.inventory_service.dto.ItemResponse;
import com.example.inventory_service.entity.Item;
import com.example.order_service.event.OrderEvent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface InventoryService {

    ItemResponse getItemById(Long itemId);

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
