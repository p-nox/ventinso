package com.example.inventory_preview_service.repository;

import com.example.inventory_preview_service.entity.ItemPreview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PreviewRepository extends MongoRepository<ItemPreview, String> {

    List<ItemPreview> findAllByUserIdAndStatus(Long userId, String status);

    List<ItemPreview> findAllByUserIdAndStatusIn(Long userId, List<String> statuses);

    List<ItemPreview> findAllByUserId(Long userId);

}
