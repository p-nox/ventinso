package com.example.order_service.utils;

import com.example.order_service.dto.OrderProgressUpdateDto;
import com.example.order_service.dto.OrderResponse;
import com.example.order_service.entity.Order;
import com.example.order_service.dto.OrderRequest;

@org.mapstruct.Mapper(componentModel = "spring")
public interface Mapper {

    Order toEntity(OrderRequest dto);

    OrderResponse toResponse(Order entity);

    OrderProgressUpdateDto toProgressDto(Order entity);


}
