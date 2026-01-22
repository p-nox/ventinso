package com.example.apigateway.configuration;

public final class ApiConfig {

    private ApiConfig() {}

    // --- Service IDs ---
    public static final String USER_SERVICE = "USER-SERVICE";
    public static final String INVENTORY_SERVICE = "INVENTORY-SERVICE";
    public static final String ORDER_SERVICE = "ORDER-SERVICE";
    public static final String AUTH_SERVICE = "AUTH-SERVICE";
    public static final String NOTIFICATION_SERVICE = "NOTIFICATION-SERVICE";
    public static final String PREVIEW_SERVICE = "PREVIEW-INVENTORY-SERVICE";
    public static final String PAYMENT_SERVICE = "PAYMENT-SERVICE";
    public static final String CHAT_SERVICE = "CHAT-SERVICE";


    // --- API paths ---
    public static final String AUTH_SERVICE_URL = "/api/auth";
    public static final String INVENTORY_SERVICE_URL = "/api/inventory";
    public static final String NOTIFICATION_SERVICE_URL = "/api/notifications";
    public static final String PREVIEW_SERVICE_URL = "/api/preview";
    public static final String USER_SERVICE_URL = "/api/users";
    public static final String ORDER_SERVICE_URL = "/api/orders";
    public static final String IMAGE_SERVICE_URL = "/api/images";
    public static final String RATING_SERVICE_URL = "/api/ratings";
    public static final String WALLET_SERVICE_URL = "/api/wallet";
    public static final String PAYMENT_SERVICE_URL = "/api/payments";
    public static final String STRIPE_WEBHOOK_SERVICE_URL = "/stripe";
    public static final String CHAT_SERVICE_URL = "/api/chat";
}
