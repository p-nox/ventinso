package com.example.inventory_service.service.implementation;

import com.example.inventory_service.dto.CategoryResponse;
import com.example.inventory_service.dto.CreateUpdateItemRequest;
import com.example.inventory_service.dto.ItemResponse;
import com.example.inventory_service.entity.Category;
import com.example.inventory_service.entity.Item;
import com.example.inventory_service.enums.ItemStatus;
import com.example.inventory_service.event.ItemCreateUpdateEvent;
import com.example.inventory_service.event.PriceUpdateEvent;
import com.example.inventory_service.exception.ResourceNotFoundException;
import com.example.inventory_service.repository.CategoryRepository;
import com.example.inventory_service.repository.InventoryRepository;
import com.example.inventory_service.service.ImageStorageService;
import com.example.inventory_service.service.InventoryService;
import com.example.inventory_service.utils.Mapper;
import com.example.order_service.event.OrderEvent;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.function.Function;

@Slf4j
@Service
@AllArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final ImageStorageService imageStorageService;
    private final Mapper mapper;
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public ItemResponse getItemById(Long itemId) {
        Item item = findItemById(itemId);
        incrementViewCount(item);
        ItemResponse response = mapper.toDto(item);
        List<String> imageUrls = imageStorageService.getImageUrlsForItem(response.getId());
        response.setImageUrls(imageUrls);
        String thumbnailUrlToMatch = imageStorageService.getThumbnailForItem(itemId);

        String thumbnailUrl = imageUrls.stream()
                .filter(url -> url.equals(thumbnailUrlToMatch))
                .findFirst()
                .orElse(null);
        response.setThumbnailUrl(thumbnailUrl);
        return response;
    }

    @Override
    public List<CategoryResponse> getCategories(){
        List<Category> categories = categoryRepository.findAll();
        return convertToDtoList(categories, mapper::toDto);
    }

    @Override
    public void createItem(CreateUpdateItemRequest request, List<MultipartFile> itemImages) {
        try {
            Item item = mapper.toEntity(request);
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            item.setCategory(category);
            Item savedItem = inventoryRepository.save(item);

            imageStorageService.saveImagesForItem(savedItem.getId(), itemImages, request.getThumbnail());
            String thumbnail = imageStorageService.getThumbnailForItem(savedItem.getId());

            ItemCreateUpdateEvent event = mapper.toEvent(savedItem);
            event.setThumbnailUrl(thumbnail);
            kafkaTemplate.send("inventory.item.created", event);
        } catch (Exception e) {
            log.error("!!! Exception in createItem(): {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void deleteItem(Long itemId) {
        inventoryRepository.deleteByIdDirectly(itemId);
        imageStorageService.deleteImagesForItem(itemId);
        kafkaTemplate.send("inventory.item.deleted",itemId);
    }

    @Transactional
    @Override
    public void updateItem(Long itemId, CreateUpdateItemRequest updatedItem, List<MultipartFile> itemImages) {
        log.info("Updating item with id: {}", itemId);
        log.info("UpdatedItem DTO: {}", updatedItem);
        log.info("Number of uploaded images: {}", itemImages != null ? itemImages.size() : 0);

        Item existingItem = findItemById(itemId);
        BigDecimal oldPrice = existingItem.getPrice();
        log.info("Existing item before update: {}", existingItem);

        mapper.updateItemFromDto(updatedItem, existingItem);
        log.info("Existing item after mapping DTO: {}", existingItem);

        Category newCategory = categoryRepository.findById(updatedItem.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        existingItem.setCategory(newCategory);

        Item savedItem = inventoryRepository.saveAndFlush(existingItem);
        log.info("Saved item: {}", savedItem);

        imageStorageService.saveImagesForItem(savedItem.getId(), itemImages, updatedItem.getThumbnail());
        String thumbnail = imageStorageService.getThumbnailForItem(itemId);
        log.info("Thumbnail after saving images: {}", thumbnail);

        ItemCreateUpdateEvent itemUpdateEvent = mapper.toEvent(savedItem);
        itemUpdateEvent.setThumbnailUrl(thumbnail);
        log.info("ItemUpdateEvent to send: {}", itemUpdateEvent);

        kafkaTemplate.send("inventory.item.updated", itemUpdateEvent);

        if (savedItem.getPrice().compareTo(oldPrice) < 0) {
            PriceUpdateEvent priceUpdateEvent = PriceUpdateEvent.builder()
                    .itemId(savedItem.getId())
                    .title(savedItem.getTitle())
                    .price(savedItem.getPrice())
                    .oldPrice(oldPrice)
                    .action("PRICE_UPDATE")
                    .build();
            log.info("PriceUpdateEvent to send: {}", priceUpdateEvent);
            kafkaTemplate.send("inventory.item.price.updated", priceUpdateEvent);
        }
    }

    @Override
    @Transactional
    public void updateItemPreference(Long itemId, String preference, String value) {
        Boolean booleanValue = Boolean.parseBoolean(value);
        Item item = findItemById(itemId);

        ItemCreateUpdateEvent itemUpdateEvent = ItemCreateUpdateEvent.builder()
                .itemId(itemId.toString())
                .build();

        switch (preference) {
            case "openToOffers":
                item.setOpenToOffers(booleanValue);
                itemUpdateEvent.setOpenToOffers(booleanValue);
                break;
            case "pickUpByAppointment":
                item.setPickUpByAppointment(booleanValue);
                itemUpdateEvent.setPickUpByAppointment(booleanValue);
                break;
            default:
                throw new IllegalArgumentException("Unknown preference: " + preference);
        }
        kafkaTemplate.send("inventory.item.preference.updated", itemUpdateEvent);
    }

    @Override
    public void updateWatchersCount(Long itemId, int delta) {
        log.info("Updating watchers count for itemId={} with delta={}", itemId, delta);
        inventoryRepository.updateWatchersCount(itemId, delta);
    }

    @Override
    public void updateItemStatus(Long itemId, String status) {
        int updated = inventoryRepository.updateStatusById(itemId, ItemStatus.valueOf(status));
        if (updated == 0) throw new ResourceNotFoundException("Item with id " + itemId + " doesn't exist!");

        ItemCreateUpdateEvent itemUpdateEvent = ItemCreateUpdateEvent.builder()
                .itemId(itemId.toString())
                .status(status)
                .build();
        kafkaTemplate.send("inventory.item.status.updated", itemUpdateEvent);
    }

    @Transactional
    @Override
    public boolean isItemValid(Item item, OrderEvent event) {
        log.info("Validating item: id={}, title={}, status={}, userId={}, eventId={}, eventSellerId={}, eventPrice={}, orderType={}",
                item.getId(), item.getTitle(), item.getStatus(), item.getUserId(),
                event.getId(), event.getSellerId(), event.getPrice(), event.getOrderType());

        boolean statusMatches = ItemStatus.ACTIVE.equals(item.getStatus());
        boolean sellerMatches = item.getUserId().equals(event.getSellerId());

        // Έλεγχος τιμής μόνο αν δεν είναι OFFER
        boolean priceMatches = true;
        if (!"OFFER".equalsIgnoreCase(event.getOrderType())) {
            priceMatches = item.getPrice().compareTo(event.getPrice()) == 0;
        }

        log.info("Validation details for itemId {}: statusMatches={}, sellerMatches={}, priceMatches={}",
                item.getId(), statusMatches, sellerMatches, priceMatches);

        boolean isValid = statusMatches && sellerMatches && priceMatches;

        if (isValid) {
            log.info("Item {} is valid. Reserving and updating status to RESERVED.", item.getId());
            item.setStatus(ItemStatus.RESERVED);
            Item savedItem = inventoryRepository.saveAndFlush(item);

            ItemCreateUpdateEvent itemUpdateEvent = mapper.toEvent(savedItem);
            log.info("Sending Kafka event 'inventory.item.updated' for itemId={}", savedItem.getId());
            kafkaTemplate.send("inventory.item.updated", itemUpdateEvent);
        } else {
            log.warn("Item {} is not valid for OrderEvent {}.", item.getId(), event.getId());
        }

        return isValid;
    }



    @Override
    public Item findItemById(Long itemId){
        return inventoryRepository.findById(itemId).orElseThrow(
                () -> new ResourceNotFoundException("Item with id " + itemId + " doesn't exist!")
        );
    }

    private <T, R> List<R> convertToDtoList(List<T> entities, Function<T, R> mapper) {
        return entities.stream().map(mapper).toList();
    }

    private void incrementViewCount(Item item) {
        item.setViews(item.getViews() + 1);
        inventoryRepository.save(item);
    }
}
