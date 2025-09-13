package com.example.inventory_service.repository;

import com.example.inventory_service.entity.Item;
import com.example.inventory_service.enums.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Item, Long> {

    List<Item> findAllByUserId(Long usedId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Item i WHERE i.id = :itemId")
    void deleteByIdDirectly(@Param("itemId") Long itemId);

    @Modifying
    @Transactional
    @Query("UPDATE Item i SET i.status = :status WHERE i.id = :itemId")
    int updateStatusById(@Param("itemId") Long itemId, @Param("status") ItemStatus status);

    @Modifying
    @Transactional
    @Query("UPDATE Item i SET i.watchersCount = i.watchersCount + :delta WHERE i.id = :itemId")
    void updateWatchersCount(@Param("itemId") Long itemId, @Param("delta") int delta);

}