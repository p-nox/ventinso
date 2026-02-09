package com.example.inventory_service.utils;

import com.example.inventory_service.dto.response.CategoryResponse;
import com.example.inventory_service.dto.request.CreateUpdateItemRequest;
import com.example.inventory_service.dto.response.ItemPageResponse;
import com.example.inventory_service.dto.response.ItemSummaryResponse;
import com.example.inventory_service.entity.Category;
import com.example.inventory_service.entity.Item;
import com.example.inventory_service.event.ItemCreateUpdateEvent;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

@org.mapstruct.Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface Mapper {


    @Mapping(source = "id", target = "itemId")
    @Mapping(source = "userId", target = "userId")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "status", target = "status", qualifiedByName = "enumToString")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "condition", target = "condition", qualifiedByName = "enumToString")
    @Mapping(source = "watchersCount", target = "watchers")
    @Mapping(source = "openToOffers", target = "openToOffers")
    @Mapping(source = "pickUpByAppointment", target = "pickUpByAppointment")
    ItemSummaryResponse toListDto(Item entity);


    @Mapping(target = "id", ignore = true)
    @Mapping(source = "categoryId", target = "category.id")
    Item toEntity(CreateUpdateItemRequest itemRequest);

    @Mapping(source = "id", target = "itemId")
    @Mapping(source = "category.name", target = "category")
    @Mapping(source = "watchersCount", target = "watchers")
    ItemPageResponse toDto(Item entity);

    CategoryResponse toDto(Category entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "views", ignore = true)
    void updateItemFromDto(CreateUpdateItemRequest itemRequest, @MappingTarget Item itemEntity);

    @Mapping(source = "id", target = "itemId", qualifiedByName = "longToString")
    @Mapping(source = "condition", target = "condition", qualifiedByName = "enumToString")
    @Mapping(source = "status", target = "status", qualifiedByName = "enumToString")
    @Mapping(source = "category.name", target = "category")
    ItemCreateUpdateEvent toEvent(Item entity);

    @Named("longToString")
    default String longToString(Long id) {
        return id != null ? id.toString() : null;
    }

    @Named("enumToString")
    default String enumToString(Enum<?> e) {
        return e != null ? e.name() : null;
    }
}
