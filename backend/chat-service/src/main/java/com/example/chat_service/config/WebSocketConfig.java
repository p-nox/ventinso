package com.example.chat_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(128 * 1024 * 1024);   // 26 MB
        container.setMaxBinaryMessageBufferSize(128 * 1024 * 1024); // 26 MB
        container.setMaxSessionIdleTimeout(30000L);
        // Logging
        System.out.println("Max text message buffer size: " + container.getMaxTextMessageBufferSize());
        System.out.println("Max binary message buffer size: " + container.getMaxBinaryMessageBufferSize());
        System.out.println("Max session idle timeout: " + container.getMaxSessionIdleTimeout());
        return container;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chats")
                .setAllowedOriginPatterns(frontendUrl)
                .withSockJS()
                .setStreamBytesLimit(128 * 1024 * 1024)
                .setHttpMessageCacheSize(128 * 1024 * 1024);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024 * 1024);
        registration.setSendBufferSizeLimit(128 * 1024 * 1024);
        registration.setSendTimeLimit(60 * 1000);
        WebSocketMessageBrokerConfigurer.super.configureWebSocketTransport(registration);
    }


}
