package com.example.inventory_service.repository;

import com.example.inventory_service.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {

    List<ItemImage> findAllByItemId(Long itemId);

    Optional<ItemImage> findByFilename(String filename);

    Optional<ItemImage> findByItemIdAndThumbnailTrue(Long itemId);

    @Modifying
    @Transactional
    @Query("UPDATE ItemImage i SET i.thumbnail = false WHERE i.itemId = :itemId AND i.thumbnail = true")
    void clearThumbnailForItem(@Param("itemId") Long itemId);
}
