package com.example.inventory_service.service.implementation;

import com.example.inventory_service.dto.response.CategoryResponse;
import com.example.inventory_service.dto.request.CreateUpdateItemRequest;
import com.example.inventory_service.dto.response.ItemPageResponse;
import com.example.inventory_service.dto.response.ItemSummaryResponse;
import com.example.inventory_service.entity.Category;
import com.example.inventory_service.entity.Item;
import com.example.inventory_service.entity.ItemViewKey;
import com.example.inventory_service.entity.ItemViews;
import com.example.inventory_service.enums.ItemStatus;
import com.example.inventory_service.event.ItemCreateUpdateEvent;
import com.example.inventory_service.event.PriceUpdateEvent;
import com.example.inventory_service.event.WatcherUpdateEvent;
import com.example.inventory_service.exception.ResourceNotFoundException;
import com.example.inventory_service.repository.CategoryRepository;
import com.example.inventory_service.repository.InventoryRepository;
import com.example.inventory_service.repository.ItemViewsRepository;
import com.example.inventory_service.service.ImageStorageService;
import com.example.inventory_service.service.InventoryService;
import com.example.inventory_service.utils.Mapper;
import com.example.order_service.event.OrderEvent;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final CategoryRepository categoryRepository;
    private final ItemViewsRepository itemViewsRepository;
    private final ImageStorageService imageStorageService;
    private final Mapper mapper;
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public ItemPageResponse getItemById(Long itemId, Long userId, boolean fetchOtherActiveItems) {
        Item item = findItemById(itemId);
        log.info("item" + item);
        if (userId != null) incrementViewCount(item, userId);
        ItemPageResponse response = mapper.toDto(item);
        log.info("response" + response);
        populateImages(response);


        if(fetchOtherActiveItems){
            List<ItemSummaryResponse> previews = getAllOtherActiveItemsForUserId( response.getUserId(), response.getItemId());
            response.setListOfUserItems(previews);
            if( item.getStatus().equals(ItemStatus.SOLD)){
                response.setTotalItems(previews.size()); // if the requested item is Sold the available item must not been included
            }
            else {
                response.setTotalItems(previews.size() + 1); // +1 for the requested item
            }

        }
        return response;
    }

    @Override
    public List<ItemSummaryResponse> getAllItemsByUserId(Long userId, boolean includeHiddenItems) {
        List<Item> items;

        if (includeHiddenItems) {
            items = inventoryRepository.findAllByUserId(userId);
        } else {
            items = inventoryRepository.findAllByUserIdAndStatus(userId, ItemStatus.ACTIVE);
        }
        return mapItemsToDtoWithThumbnail(items);
    }

    @Override
    public List<ItemSummaryResponse> getAllOtherActiveItemsForUserId(Long userId, Long excludeItemId) {
        List<Item> items = inventoryRepository.findAllByUserIdAndStatusAndIdNot(
                userId,
                ItemStatus.ACTIVE,
                excludeItemId
        );
        return mapItemsToDtoWithThumbnail(items);
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
        itemViewsRepository.deleteViewsForItem(itemId);
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
                    .thumbnail(thumbnail)
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
        inventoryRepository.updateWatchersCount(itemId, delta);

        Long watchers = inventoryRepository.getWatchersCount(itemId);
        WatcherUpdateEvent watcherUpdateEvent = WatcherUpdateEvent.builder()
                .itemId(itemId)
                .watchers(watchers)
                .build();
        kafkaTemplate.send("inventory.item.watchers.updated", watcherUpdateEvent);
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

        boolean statusMatches = ItemStatus.ACTIVE.equals(item.getStatus());
        boolean sellerMatches = item.getUserId().equals(event.getSellerId());

        // Έλεγχος τιμής μόνο αν δεν είναι OFFER
        boolean priceMatches = true;
        if (!"OFFER".equalsIgnoreCase(event.getOrderType())) {
            priceMatches = item.getPrice().compareTo(event.getPrice()) == 0;
        }

        boolean isValid = statusMatches && sellerMatches && priceMatches;

        if (isValid) {
            item.setStatus(ItemStatus.RESERVED);
            Item savedItem = inventoryRepository.saveAndFlush(item);

            ItemCreateUpdateEvent itemUpdateEvent = mapper.toEvent(savedItem);
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

    private void incrementViewCount(Item item, Long userId) {
        ItemViewKey key = new ItemViewKey(item.getId(), userId);

        if (!itemViewsRepository.existsById(key)) {
            ItemViews view = new ItemViews();
            view.setId(key);
            itemViewsRepository.save(view);

            if(!item.getUserId().equals(userId)) {
                item.setViews(item.getViews() + 1);
                inventoryRepository.save(item);
            }
        }
    }

    private void populateImages(ItemPageResponse response) {
        List<String> imageUrls = imageStorageService.getImageUrlsForItem(response.getItemId());
        response.setImageUrls(imageUrls);

        String thumbnailUrlToMatch = imageStorageService.getThumbnailForItem(response.getItemId());
        String thumbnailUrl = imageUrls.stream()
                .filter(url -> url.equals(thumbnailUrlToMatch))
                .findFirst()
                .orElse(null);
        response.setThumbnailUrl(thumbnailUrl);

        log.info("Set {} images and thumbnail for itemId={}", imageUrls.size(), response.getItemId());
    }

    private List<ItemSummaryResponse> mapItemsToDtoWithThumbnail(List<Item> items) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(mapper::toListDto)
                .peek(dto -> {
                    String thumbnail = imageStorageService.getThumbnailForItem(dto.getItemId());
                    dto.setThumbnailUrl(thumbnail != null ? thumbnail : "");
                })
                .collect(Collectors.toList());
    }


}
