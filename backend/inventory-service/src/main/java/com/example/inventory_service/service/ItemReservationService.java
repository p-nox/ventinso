package com.example.inventory_service.service;

import com.example.inventory_service.entity.ItemReservation;

public interface ItemReservationService {

    void createReservation(Long itemId, Long orderId);

    void cancelReservation(ItemReservation itemReservation);

    ItemReservation getByItemIdAndOrderId(Long itemId, Long orderId);
}
