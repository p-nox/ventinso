package com.example.inventory_service.repository;


import com.example.inventory_service.entity.ItemViewKey;
import com.example.inventory_service.entity.ItemViews;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ItemViewsRepository extends JpaRepository<ItemViews, ItemViewKey> {

    boolean existsById(ItemViewKey id);

    default boolean existsByItemIdAndUserId(Long itemId, Long userId) {
        return existsById(new ItemViewKey(itemId, userId));
    }

    @Modifying
    @Transactional
    @Query("DELETE FROM ItemViews v WHERE v.id.itemId = :itemId")
    void deleteViewsForItem(@Param("itemId") Long itemId);
}
