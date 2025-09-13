package com.example.inventory_preview_service.service;

import com.example.inventory_preview_service.dto.ItemCardResponse;
import com.example.inventory_preview_service.entity.ItemPreview;
import com.example.inventory_preview_service.repository.PreviewRepository;
import com.example.inventory_preview_service.utils.Mapper;
import com.example.inventory_service.event.ItemCreateUpdateEvent;
import com.example.inventory_preview_service.event.UserLookUpEvent;
import com.example.user_service.event.UserRatingUpdateEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.Decimal128;
import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Service
@AllArgsConstructor
public class PreviewServiceImpl implements PreviewService {

    private final PreviewRepository previewRepository;
    private final MongoTemplate mongoTemplate;
    private final Mapper mapper;


    @Override
    public void updateItemPreference(ItemCreateUpdateEvent event) {
        Query query = new Query(Criteria.where("_id").is(event.getItemId()));
        Update update = new Update();
        if (event.getOpenToOffers() != null) {
            update.set("openToOffers", event.getOpenToOffers());
        }
        if (event.getPickUpByAppointment() != null) {
            update.set("pickUpByAppointment", event.getPickUpByAppointment());
        }
        if (!update.getUpdateObject().isEmpty()) {
            mongoTemplate.updateFirst(query, update, ItemPreview.class);
        } else {
            log.info("No fields to update for itemId={}", event.getItemId());
        }
    }

    @Override
    public void deleteItem(Long itemId){
        Query query = new Query(Criteria.where("_id").is(itemId.toString()));
        mongoTemplate.remove(query, ItemPreview.class);
    }

    @Override
    public void updateRatingsFromUserEvent(UserRatingUpdateEvent event) {
        log.info("Received UserRatingUpdatedEvent: {}", event);

        List<ItemPreview> previews = previewRepository.findAllByUserId(event.getUserId());
        if (previews.isEmpty()) {
            return;
        }

        previews.forEach(item -> {
            item.setAvgOverallRating(event.getAvgOverallRating());
            item.setTotalRatings(event.getTotalRatings());
        });
        previewRepository.saveAll(previews);

    }

    @Override
    public List<ItemCardResponse> getLatestItems(int limit, int offset) {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("ACTIVE"));
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        query.skip(offset);
        query.limit(limit);

        List<ItemPreview> latestItems = mongoTemplate.find(query, ItemPreview.class);

        log.info("Fetched {} ACTIVE items (offset={})", latestItems.size(), offset);
        latestItems.forEach(item ->
                log.info("Item fetched: id={}, status={}, createdAt={}",
                        item.getItemId(), item.getStatus(), item.getCreatedAt())
        );

        Collections.shuffle(latestItems);
        return convertToDtoList(latestItems);
    }




    @Override
    public List<ItemCardResponse> getItemsByFilters(
            String q,
            String category,
            String type,
            String condition,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int n) {

        Query query = new Query();
        query.limit(n);

        // Status always ACTIVE
        query.addCriteria(Criteria.where("status").is("ACTIVE"));

        // Text search
        if (q != null && !q.isEmpty() && !"null".equalsIgnoreCase(q)) {
            TextCriteria textCriteria = TextCriteria.forDefaultLanguage().matching(q);
            query.addCriteria(textCriteria);
        }

        // Category filter
        if (category != null && !category.isEmpty() && !"null".equalsIgnoreCase(category)) {
            query.addCriteria(Criteria.where("category").is(category));
        }

        // Type filter
        if (type != null && !type.isEmpty() && !"null".equalsIgnoreCase(type)) {
            query.addCriteria(Criteria.where("type").is(type));
        }

        // Condition filter
        if (condition != null && !condition.isEmpty() && !"null".equalsIgnoreCase(condition)) {
            query.addCriteria(Criteria.where("condition").is(condition));
        }

        // Price filter using Decimal128
        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) {
                priceCriteria = priceCriteria.gte(new Decimal128(minPrice));
            }
            if (maxPrice != null) {
                priceCriteria = priceCriteria.lte(new Decimal128(maxPrice));
            }
            query.addCriteria(priceCriteria);
        }


        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        List<ItemPreview> items = mongoTemplate.find(query, ItemPreview.class);
        return convertToDtoList(items);
    }

    @Override
    public void updateOrCreateItemPreviewFromEvent(ItemCreateUpdateEvent event) {
        Optional<ItemPreview> optionalItem = previewRepository.findById(event.getItemId());
        log.info("Updating thumbnail {}'", event.getThumbnailUrl());
        if (optionalItem.isEmpty()) {
            ItemPreview itemPreview = mapper.toEntity(event);
            roundPrice(itemPreview);
            previewRepository.save(itemPreview);
            return;
        }

        ItemPreview item = optionalItem.get();

        if (event.getTitle() != null) item.setTitle(event.getTitle());
        if (event.getDescription() != null) item.setDescription(event.getDescription());
        if (event.getPrice() != null) {
            item.setPrice(event.getPrice());
            roundPrice(item);
        }
        if (event.getCondition() != null) item.setCondition(event.getCondition());
        if (event.getStatus() != null) item.setStatus(event.getStatus());
        if (event.getUserId() != null) item.setUserId(event.getUserId());
        if (event.getCategory() != null) item.setCategory(event.getCategory());
        if (event.getThumbnailUrl() != null) {
            log.info("Updating thumbnail for itemId={} with URL='{}'", event.getItemId(), event.getThumbnailUrl());
            item.setThumbnailUrl(event.getThumbnailUrl());
        }

        if (event.getCreatedAt() != null) item.setCreatedAt(event.getCreatedAt());
        if (event.getOpenToOffers() != null) item.setOpenToOffers(event.getOpenToOffers());
        if (event.getPickUpByAppointment() != null) item.setPickUpByAppointment(event.getPickUpByAppointment());

        previewRepository.save(item);
    }

    @Override
    public void updateItemFromUserEvent(UserLookUpEvent event) {
        List<ItemPreview> items = previewRepository.findAllByUserId(event.getUserId());
        if (items.isEmpty()) {
            log.info("No items found for userId={}", event.getUserId());
            return;
        }

        String username = event.getUsername();
        for (ItemPreview item : items) {
            item.setAvgOverallRating(event.getAvgOverallRating());
            item.setTotalRatings(event.getTotalRatings());
            if (username != null) {
                item.setUsername(username);
                log.info("Updated username for itemId={} to {}", item.getItemId(), username);
            } else {
                log.info("No username update for itemId={}", item.getItemId());
            }
            log.info("Updated ratings for itemId={} to avgOverallRating={}, totalRatings={}",
                    item.getItemId(), event.getAvgOverallRating(), event.getTotalRatings());
        }
        previewRepository.saveAll(items);
        log.info("Saved {} ItemPreview(s) for userId={}", items.size(), event.getUserId());
    }

    @Override
    public void updateItemStatus(ItemCreateUpdateEvent event) {
        Query query = new Query(Criteria.where("_id").is(event.getItemId()));
        Update update = new Update().set("status", event.getStatus());
        mongoTemplate.updateFirst(query, update, ItemPreview.class);
    }

    @Override
    public List<ItemCardResponse> getItemsByUserId(Long userId, Boolean includeHidden) {
        List<ItemPreview> entities;

        if (Boolean.TRUE.equals(includeHidden)) {
            entities = previewRepository.findAllByUserIdAndStatusIn(
                    userId,
                    List.of("ACTIVE", "HIDDEN")
            );
        } else {
            entities = previewRepository.findAllByUserIdAndStatus(userId, "ACTIVE");
        }

        if (entities.isEmpty()) {
            log.warn("No items found for userId={} (includeHidden={})", userId, includeHidden);
            return Collections.emptyList();
        }
        return convertToDtoList(entities);
    }



    private List<ItemCardResponse> convertToDtoList(List<ItemPreview> items){
        return  items.stream().map(mapper::toDto).toList();
    }

    private void roundPrice(ItemPreview item) {
        if (item.getPrice() != null) {
            item.setPrice(item.getPrice().setScale(2, RoundingMode.HALF_UP));
        }
    }
}



