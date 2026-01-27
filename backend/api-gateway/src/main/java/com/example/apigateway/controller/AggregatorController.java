package com.example.apigateway.controller;

import com.example.apigateway.configuration.ApiConfig;
import com.example.apigateway.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.List;
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
    private final WebClient previewClient;
    private final WebClient authClient;
    private final WebClient orderClient;
    private final WebClient chatClient;

    public AggregatorController(WebClient.Builder webClientBuilder) {
        this.inventoryClient = webClientBuilder.baseUrl("http://" + ApiConfig.INVENTORY_SERVICE).build();
        this.userClient = webClientBuilder.baseUrl("http://" + ApiConfig.USER_SERVICE).build();
        this.previewClient = webClientBuilder.baseUrl("http://" + ApiConfig.PREVIEW_SERVICE).build();
        this.authClient = webClientBuilder.baseUrl("http://" + ApiConfig.AUTH_SERVICE).build();
        this.orderClient = webClientBuilder.baseUrl("http://" + ApiConfig.ORDER_SERVICE).build();
        this.chatClient = webClientBuilder.baseUrl("http://" + ApiConfig.CHAT_SERVICE).build();
    }

    @GetMapping("/item/{itemId}")
    @Operation(summary = "Get item with user info", description = "Retrieve an item along with user info and user's other items")
    public Mono<ItemPageResponse> getItemWithUserInfo(
            @Parameter(description = "ID of the item") @PathVariable String itemId) {
        log.info("Entered /api/aggregated/item/{}", itemId);

        return inventoryClient.get()
                .uri(ApiConfig.INVENTORY_SERVICE_URL + "/{itemId}", itemId)
                .retrieve()
                .bodyToMono(InventoryServiceResponse.class)
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.error("Inventory service failed for itemId={}", itemId, e);
                    return Mono.empty();
                })
                .flatMap(item -> {
                    Mono<UserServiceResponse> userMono = userClient.get()
                            .uri(ApiConfig.USER_SERVICE_URL + "/{id}/summary", item.getUserId())
                            .retrieve()
                            .bodyToMono(UserServiceResponse.class)
                            .timeout(Duration.ofSeconds(3))
                            .onErrorResume(e -> {
                                log.error("User service failed for userId={}", item.getUserId(), e);
                                return Mono.just(new UserServiceResponse());
                            });

                    Mono<List<PreviewServiceResponse>> itemsMono = previewClient.get()
                            .uri("/api/preview/user/{userId}", item.getUserId())
                            .retrieve()
                            .bodyToMono(new ParameterizedTypeReference<List<PreviewServiceResponse>>() {})
                            .timeout(Duration.ofSeconds(3))
                            .onErrorResume(e -> {
                                log.error("Preview service failed for userId={}", item.getUserId(), e);
                                return Mono.just(List.of());
                            });

                    return Mono.zip(userMono, itemsMono)
                            .map(tuple -> buildItemPageResponse(item, tuple.getT1(), tuple.getT2()));
                });
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get aggregated user profile", description = "Retrieve user profile with items and ratings")
    public Mono<UserProfileResponse> getUserProfile(
            @Parameter(description = "ID of the user") @PathVariable String userId,
            @Parameter(description = "Include hidden items") @RequestParam(defaultValue = "false") Boolean includeHidden) {

        Mono<UserServiceResponse> userMono = userClient.get()
                .uri(ApiConfig.USER_SERVICE_URL + "/{id}/summary", userId)
                .retrieve()
                .bodyToMono(UserServiceResponse.class)
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(e -> {
                    log.error("User service failed for userId={}", userId, e);
                    return Mono.just(new UserServiceResponse());
                });

        Mono<List<PreviewServiceResponse>> itemsMono = previewClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(ApiConfig.PREVIEW_SERVICE_URL + "/user/{userId}")
                        .queryParam("includeHidden", includeHidden)
                        .build(userId))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<PreviewServiceResponse>>() {})
                .timeout(Duration.ofSeconds(3))
                .onErrorResume(e -> {
                    log.error("Preview service failed for userId={}", userId, e);
                    return Mono.just(List.of());
                });

        return Mono.zip(userMono, itemsMono)
                .flatMap(tuple -> {
                    UserServiceResponse user = tuple.getT1();
                    List<PreviewServiceResponse> items = tuple.getT2();
                    List<RatingResponse> ratings = user.getRatings();

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
            Mono<List<UserServiceWatchlistResponse>> watchlistMono = userClient.get()
                    .uri(ApiConfig.USER_SERVICE_URL + "/{userId}/watchlist", authUser.getUserId())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<UserServiceWatchlistResponse>>() {})
                    .timeout(Duration.ofSeconds(3))
                    .onErrorResume(error -> {
                        log.error("Watchlist fetch failed for userId={}", authUser.getUserId(), error);
                        return Mono.just(List.of());
                    });

            return watchlistMono.map(watchlist -> {
                LoginResponse response = new LoginResponse();
                response.setToken(authUser.getToken());
                response.setUserId(authUser.getUserId());
                response.setWatchlist(watchlist);
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
                .bodyToFlux(ChatSummaryResponse.class)
                .flatMap(chat -> {
                    Long otherUserId = chat.senderId().equals(userId) ? chat.receiverId() : chat.senderId();

                    Mono<UserServiceProfileResponse> userMono = userClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path(ApiConfig.USER_SERVICE_URL + "/{userId}/profile")
                                    .build(otherUserId))
                            .retrieve()
                            .bodyToMono(UserServiceProfileResponse.class)
                            .onErrorResume(e -> Mono.just(new UserServiceProfileResponse()));

                    Mono<InventoryServiceResponse> itemMono = inventoryClient.get()
                            .uri(ApiConfig.INVENTORY_SERVICE_URL + "/{itemId}", chat.itemId())
                            .retrieve()
                            .bodyToMono(InventoryServiceResponse.class)
                            .onErrorResume(e -> Mono.just(new InventoryServiceResponse()));

                    return Mono.zip(userMono, itemMono)
                            .map(tuple -> {
                                UserServiceProfileResponse user = tuple.getT1();
                                InventoryServiceResponse item = tuple.getT2();

                                return UserChatsResponse.builder()
                                        .chatId(chat.chatId())
                                        .senderId(chat.senderId())
                                        .receiverId(chat.receiverId())
                                        .itemId(chat.itemId())
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
                            });
                })
                .collectList();
    }












    private UserProfileResponse buildUserProfileResponse(UserServiceResponse user, List<PreviewServiceResponse> items) {
        return UserProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .totalSales(user.getTotalSales())
                .averageDeliveryTime(user.getAverageDeliveryTime())
                .avatarUrl(user.getAvatarUrl())
                .avgDescriptionRating(user.getAvgDescriptionRating())
                .avgPackagingRating(user.getAvgPackagingRating())
                .avgConditionRating(user.getAvgConditionRating())
                .avgOverallRating(user.getAvgOverallRating())
                .totalRatings(user.getTotalRatings())
                .ratings(user.getRatings())
                .registeredAt(user.getRegisteredAt())
                .items(items)
                .build();
    }

    private ItemPageResponse buildItemPageResponse(
            InventoryServiceResponse item,
            UserServiceResponse user,
            List<PreviewServiceResponse> userItems
    ) {
        return ItemPageResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .condition(item.getCondition())
                .status(item.getStatus())
                .type(item.getType())
                .userId(item.getUserId())
                .views(item.getViews())
                .category(item.getCategory())
                .createdAt(item.getCreatedAt())
                .imageUrls(item.getImageUrls())
                .thumbnailUrl(item.getThumbnailUrl())
                .watchersCount(item.getWatchersCount())
                .openToOffers(item.getOpenToOffers())
                .pickUpByAppointment(item.getPickUpByAppointment())
                .username(user != null ? user.getUsername() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .registeredAt(user != null ? user.getRegisteredAt() : null)
                .avgOverallRating(user != null ? user.getAvgOverallRating() : null)
                .totalRatings(user != null ? user.getTotalRatings() : null)
                .userItems(userItems)
                .build();
    }
}
