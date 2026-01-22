package com.example.apigateway.router;

import com.example.apigateway.configuration.ApiConfig;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class Router {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

                // HTTP routes
                .route("notification_http", r -> r.path(ApiConfig.NOTIFICATION_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.NOTIFICATION_SERVICE))
                .route("auth_http", r -> r.path(ApiConfig.AUTH_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.AUTH_SERVICE))
                .route("inventory_http", r -> r.path(ApiConfig.INVENTORY_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.INVENTORY_SERVICE))
                .route("order_http", r -> r.path(ApiConfig.ORDER_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.ORDER_SERVICE))
                .route("preview_http", r -> r.path(ApiConfig.PREVIEW_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.PREVIEW_SERVICE))
                .route("user_http", r -> r.path(ApiConfig.USER_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.USER_SERVICE))
                .route("image_http", r -> r.path(ApiConfig.IMAGE_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.INVENTORY_SERVICE))
                .route("rating_http", r -> r.path(ApiConfig.RATING_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.USER_SERVICE))
                .route("wallet_http", r -> r.path(ApiConfig.WALLET_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.USER_SERVICE))
                .route("payment_http", r -> r.path(ApiConfig.PAYMENT_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.PAYMENT_SERVICE))
                .route("stripe_webhook_http", r -> r.path(ApiConfig.STRIPE_WEBHOOK_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.PAYMENT_SERVICE))
                .route("chat_http", r -> r.path(ApiConfig.CHAT_SERVICE_URL + "/**")
                        .uri("lb://" + ApiConfig.CHAT_SERVICE))


                // HTTP polling route for SockJS
                .route("notifications_http", r -> r
                        .path("/notifications/info/**")
                        .uri("lb://" + ApiConfig.NOTIFICATION_SERVICE.toUpperCase())
                )
                // WebSocket upgrade route
                .route("notifications_ws", r -> r
                        .path("/notifications/**")
                        .and()
                        .header("Upgrade", "websocket")
                        .uri("lb://" + ApiConfig.NOTIFICATION_SERVICE.toUpperCase())
                )
                // HTTP polling route for SockJS
                .route("chat_http", r -> r
                        .path("/chats/info/**")
                        .uri("lb://" + ApiConfig.CHAT_SERVICE.toUpperCase())
                )
                // WebSocket upgrade route
                .route("chat_ws", r -> r
                        .path("/chats/**")
                        .and()
                        .header("Upgrade", "websocket")
                        .uri("lb://" + ApiConfig.CHAT_SERVICE.toUpperCase())
                )
                .build();
    }
}