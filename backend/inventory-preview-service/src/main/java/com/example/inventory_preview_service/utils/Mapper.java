package com.example.inventory_preview_service.utils;

import com.example.inventory_preview_service.dto.ItemCardResponse;
import com.example.inventory_preview_service.entity.ItemPreview;
import com.example.inventory_service.event.ItemCreateUpdateEvent;
import org.mapstruct.NullValuePropertyMappingStrategy;

@org.mapstruct.Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface Mapper {
    ItemCardResponse toDto(ItemPreview itemEntity);
    ItemPreview toEntity(ItemCreateUpdateEvent event);
}

