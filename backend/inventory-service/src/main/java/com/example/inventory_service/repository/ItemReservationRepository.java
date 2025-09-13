package com.example.inventory_service.repository;

import com.example.inventory_service.entity.ItemReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemReservationRepository extends JpaRepository<ItemReservation, Long> {

    ItemReservation findByItemIdAndOrderId(Long itemId, Long orderId);

}
