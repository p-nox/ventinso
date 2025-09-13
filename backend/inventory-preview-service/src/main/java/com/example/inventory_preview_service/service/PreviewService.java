package com.example.inventory_preview_service.service;

import com.example.inventory_preview_service.dto.ItemCardResponse;
import com.example.inventory_service.event.ItemCreateUpdateEvent;
import com.example.inventory_preview_service.event.UserLookUpEvent;
import com.example.user_service.event.UserRatingUpdateEvent;

import java.math.BigDecimal;
import java.util.List;

public interface PreviewService {

    void updateItemPreference(ItemCreateUpdateEvent event);

    void deleteItem(Long itemId);

    void updateRatingsFromUserEvent(UserRatingUpdateEvent event);

    List<ItemCardResponse> getLatestItems(int n, int offset);

    List<ItemCardResponse> getItemsByFilters(
            String q,
            String category,
            String type,
            String condition,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int n);

    void updateOrCreateItemPreviewFromEvent(ItemCreateUpdateEvent event);

    void updateItemFromUserEvent(UserLookUpEvent event);

    void updateItemStatus(ItemCreateUpdateEvent event);

    List<ItemCardResponse> getItemsByUserId(Long userId, Boolean includeHidden );



}
