package com.example.apigateway.controller;

import com.example.apigateway.configuration.ApiConfig;
import com.example.apigateway.dto.*;
import com.example.apigateway.dto.response.*;
import com.example.apigateway.dto.serviceResponse.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin("http://localhost:5173")
@RestController
@RequestMapping("/api/aggregated")
@Slf4j
@Tag(name = "Aggregator", description = "Aggregate data from multiple services into single responses")
public class AggregatorController {

    private final WebClient inventoryClient;
    private final WebClient userClient;
    private final WebClient authClient;
    private final WebClient orderClient;
    private final WebClient chatClient;

    public AggregatorController(WebClient.Builder webClientBuilder) {
        this.inventoryClient = webClientBuilder.baseUrl("http://" + ApiConfig.INVENTORY_SERVICE).build();
        this.userClient = webClientBuilder.baseUrl("http://" + ApiConfig.USER_SERVICE).build();
        this.authClient = webClientBuilder.baseUrl("http://" + ApiConfig.AUTH_SERVICE).build();
        this.orderClient = webClientBuilder.baseUrl("http://" + ApiConfig.ORDER_SERVICE).build();
        this.chatClient = webClientBuilder.baseUrl("http://" + ApiConfig.CHAT_SERVICE).build();
    }

    @GetMapping("/item/{itemId}")
    public Mono<ItemPageResponse> getItemWithUserInfo(
            @Parameter(description = "ID of the item")
            @PathVariable String itemId,
            @Parameter(description = "ID of the requesting user (optional)")
            @RequestParam(required = false) Long userId) {

        Mono<InventoryServiceResponse> itemMono = inventoryClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(ApiConfig.INVENTORY_SERVICE_URL + "/{itemId}")
                        .queryParamIfPresent("userId", Optional.ofNullable(userId))
                        .queryParam("fetchOtherActiveItems", true)
                        .build(itemId))
                .retrieve()
                .bodyToMono(InventoryServiceResponse.class)
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.error("Inventory failed {}", itemId, e);
                    return Mono.empty();
                });


        return itemMono.flatMap(item -> {
            Long ownerId = item.getUserId(); // ownerId from Inventory response

            Mono<UserServiceResponse> userMono = userClient.get()
                    .uri(ApiConfig.USER_SERVICE_URL + "/{ownerId}/summary", ownerId)
                    .retrieve()
                    .bodyToMono(UserServiceResponse.class)
                    .timeout(Duration.ofSeconds(3))
                    .onErrorResume(e -> {
                        log.error("User failed {}", ownerId, e);
                        return Mono.just(new UserServiceResponse());
                    });

            return Mono.zip(Mono.just(item), userMono)
                    .map(tuple -> buildItemPageResponse(tuple.getT1(), tuple.getT2()));
        });
    }






    // get Order




   // θα φυγει order
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get aggregated user profile", description = "Retrieve user profile with items and ratings")
    public Mono<UserProfileResponse> getUserProfile(
            @Parameter(description = "ID of the user") @PathVariable String userId,
            @Parameter(description = "Include hidden items") @RequestParam(defaultValue = "false") boolean includeHiddenItems) {

        // Fetch user info
        Mono<UserServiceResponse> userMono = userClient.get()
                .uri(ApiConfig.USER_SERVICE_URL + "/{userId}/summary", userId)
                .retrieve()
                .bodyToMono(UserServiceResponse.class)
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(e -> {
                    log.error("User service failed for userId={}", userId, e);
                    return Mono.just(new UserServiceResponse());
                });

        // Fetch items from inventory service
        Mono<List<InventoryServiceResponse.ItemSummaryResponse>> itemsMono = inventoryClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(ApiConfig.INVENTORY_SERVICE_URL + "/{userId}/items")
                        .queryParam("includeHiddenItems", includeHiddenItems)
                        .build(userId))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<InventoryServiceResponse.ItemSummaryResponse>>() {})
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.error("Inventory service failed for userId={}", userId, e);
                    return Mono.just(List.of());
                });

        return Mono.zip(userMono, itemsMono)
                .flatMap(tuple -> {
                    UserServiceResponse user = tuple.getT1();
                    List<InventoryServiceResponse.ItemSummaryResponse> items = tuple.getT2();
                    List<UserServiceResponse.RatingResponse> ratings = user.getRatings();

                    if (ratings == null || ratings.isEmpty()) {
                        return Mono.just(buildUserProfileResponse(user, items));
                    }

                    return Flux.fromIterable(ratings)
                            .flatMap(rating -> orderClient.get()
                                    .uri(ApiConfig.ORDER_SERVICE_URL + "/order/{orderId}/title", rating.getOrderId())
                                    .retrieve()
                                    .bodyToMono(OrderServiceItemTitleResponse.class)
                                    .timeout(Duration.ofSeconds(2))
                                    .onErrorResume(e -> {
                                        log.error("Error fetching order title for orderId={}", rating.getOrderId(), e);
                                        OrderServiceItemTitleResponse fallback = new OrderServiceItemTitleResponse();
                                        fallback.setItemTitle("Unknown");
                                        return Mono.just(fallback);
                                    })
                                    .map(orderTitle -> {
                                        rating.setItemTitle(orderTitle.getItemTitle());
                                        return rating;
                                    })
                            )
                            .collectList()
                            .map(enrichedRatings -> {
                                user.setRatings(enrichedRatings);
                                return buildUserProfileResponse(user, items);
                            });
                });
    }


    @PostMapping("/me")
    @Operation(summary = "Get my profile", description = "Authenticate and retrieve aggregated data for the logged-in user")
    public Mono<LoginResponse> bootstrapLogin(
            @Parameter(description = "Login credentials") @RequestBody LoginRequest loginDto) {
        log.info("Fetching aggregated user info for /me");

        Mono<AuthServiceResponse> authUserMono = authClient.post()
                .uri(ApiConfig.AUTH_SERVICE_URL + "/login")
                .bodyValue(loginDto)
                .retrieve()
                .bodyToMono(AuthServiceResponse.class)
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(error -> {
                    log.error("Auth service failed", error);
                    return Mono.empty();
                });

        return authUserMono.flatMap(authUser -> {
            Mono<UserServiceBootstrapResponse> userMono = userClient.get()
                    .uri(ApiConfig.USER_SERVICE_URL + "/{userId}/bootstrap", authUser.getUserId())
                    .retrieve()
                    .bodyToMono(UserServiceBootstrapResponse.class)
                    .timeout(Duration.ofSeconds(3))
                    .onErrorResume(error -> {
                        log.error("User fetch failed for userId={}", authUser.getUserId(), error);
                        return Mono.just(UserServiceBootstrapResponse.builder().build());
                    });

            return userMono.map(userData -> {
                LoginResponse response = new LoginResponse();
                response.setToken(authUser.getToken());
                response.setUserId(authUser.getUserId());
                response.setUserData(userData);
                return response;
            });
        });
    }


    @GetMapping("/user-chats/{userId}")
    @Operation(summary = "Get aggregated chats for sidebar", description = "Fetch chats with participant info, item info and last message")
    public Mono<List<UserChatsResponse>> getUserChats(@PathVariable("userId") Long userId) {
        return chatClient.get()
                .uri(ApiConfig.CHAT_SERVICE_URL + "/user-chats/{userId}", userId)
                .retrieve()
                .bodyToFlux(ChatServiceResponse.class)
                .flatMap(chat -> {
                    Long otherUserId = chat.senderId().equals(userId)
                            ? chat.receiverId()
                            : chat.senderId();

                    Mono<UserServiceResponse> userMono = userClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path(ApiConfig.USER_SERVICE_URL + "/{userId}/summary")
                                    .build(otherUserId))
                            .retrieve()
                            .bodyToMono(UserServiceResponse.class)
                            .onErrorResume(e -> Mono.just(new UserServiceResponse()));

                    Mono<InventoryServiceResponse> itemMono = inventoryClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path(ApiConfig.INVENTORY_SERVICE_URL + "/{itemId}")
                                    .build(chat.itemId()))
                            .retrieve()
                            .bodyToMono(InventoryServiceResponse.class)
                            .onErrorResume(e -> {
                                log.error("Inventory failed itemId={}", chat.itemId(), e);
                                return Mono.just(new InventoryServiceResponse());
                            });

                    return Mono.zip(userMono, itemMono)
                            .map(tuple -> buildUserChatsResponse(
                                    chat,
                                    tuple.getT1(),
                                    tuple.getT2()
                            ));
                })
                .collectList();
    }


        private UserChatsResponse buildUserChatsResponse(
            ChatServiceResponse chat,
            UserServiceResponse user,
            InventoryServiceResponse item
    ) {
        return UserChatsResponse.builder()
                .chatId(chat.chatId())
                .senderId(chat.senderId())
                .receiverId(chat.receiverId())
                .itemId(chat.itemId())
                .itemOwnerId(item.getUserId())
                .lastMessage(chat.lastMessage())
                .lastUpdated(chat.lastUpdated())

                // User info
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())

                // Item info
                .title(item.getTitle())
                .price(item.getPrice())
                .thumbnailUrl(item.getThumbnailUrl())
                .condition(item.getCondition())
                .build();
    }


    private UserProfileResponse buildUserProfileResponse(UserServiceResponse user, List<InventoryServiceResponse.ItemSummaryResponse> items) {
        int active = (int) items.stream()
                .filter(i -> "ACTIVE".equals(i.getStatus()))
                .count();

        int hidden = (int) items.stream()
                .filter(i -> "HIDDEN".equals(i.getStatus()))
                .count();

        return UserProfileResponse.builder()
                .user(user)
                .userItems(items)
                .totalItems(active)        // Number of items visible publicly (Active items only)
                .totalActiveItems(active)  // Number of active items, used for the "Active" tab
                .totalHiddenItems(hidden)  // Number of hidden items, used for the "Hidden" tab (owner only)
                .build();
    }

    private ItemPageResponse buildItemPageResponse(InventoryServiceResponse item, UserServiceResponse user) {
        return ItemPageResponse.builder()
                .item(item)
                .user(ItemPageResponse.UserPreview.builder()
                        .userId(user != null ? user.getUserId() : null)
                        .username(user != null ? user.getUsername() : null)
                        .avatarUrl(user != null ? user.getAvatarUrl() : null)
                        .registeredAt(user != null ? user.getRegisteredAt() : null)
                        .avgOverallRating(user != null ? user.getAvgOverallRating() : null)
                        .totalRatings(user != null ? user.getTotalRatings() : null)
                        .build())
                .build();
    }


}
