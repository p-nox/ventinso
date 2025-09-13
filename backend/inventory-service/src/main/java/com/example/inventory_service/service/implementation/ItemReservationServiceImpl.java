package com.example.inventory_service.service.implementation;

import com.example.inventory_service.entity.ItemReservation;
import com.example.inventory_service.repository.ItemReservationRepository;
import com.example.inventory_service.service.ItemReservationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class ItemReservationServiceImpl implements ItemReservationService {

    private final ItemReservationRepository itemReservationRepository;

    @Override
    public void createReservation(Long itemId, Long orderId){
        itemReservationRepository.save(ItemReservation.builder()
                .itemId(itemId)
                .orderId(orderId)
                .build());
    }

    @Override
    public void cancelReservation(ItemReservation itemReservation){
        itemReservationRepository.delete(itemReservation);
    }

    @Override
    public ItemReservation getByItemIdAndOrderId(Long itemId, Long orderId){
      return itemReservationRepository.findByItemIdAndOrderId(itemId, orderId);
    }
}
