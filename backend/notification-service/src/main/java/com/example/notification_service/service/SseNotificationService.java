package com.example.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseNotificationService {

    private final Map<Long, List<SseEmitter>> clients = new ConcurrentHashMap<>();

    public SseEmitter register(long userId) {
        log.info("Registering SSE connection for userId={}", userId);

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        clients.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        log.info("SSE emitter added for userId={} -> total emitters={}", userId, clients.get(userId).size());

        emitter.onCompletion(() -> {
            clients.get(userId).remove(emitter);
            log.info("SSE connection completed for userId={} -> remaining emitters={}", userId, clients.getOrDefault(userId, Collections.emptyList()).size());
        });

        emitter.onTimeout(() -> {
            clients.get(userId).remove(emitter);
            log.info("SSE connection timed out for userId={} -> remaining emitters={}", userId, clients.getOrDefault(userId, Collections.emptyList()).size());
        });

        emitter.onError((e) -> {
            clients.get(userId).remove(emitter);
            log.error("SSE connection error for userId={} -> remaining emitters={}, error={}", userId, clients.getOrDefault(userId, Collections.emptyList()).size(), e.getMessage());
        });

        return emitter;
    }



    public void sendNotification(long userId, Object notification) {
        List<SseEmitter> emitters = clients.getOrDefault(userId, Collections.emptyList());

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        for (SseEmitter emitter : emitters) {
            try {
                String payload = mapper.writeValueAsString(notification);
                log.info("Sending SSE to user {}: {}", userId, payload);

                emitter.send(
                        SseEmitter.event()
                                .name("notification")
                                .data(payload)
                );

                log.info("Notification sent successfully to emitter {}", emitter);
            } catch (IOException e) {
                log.error("Error sending SSE to emitter {}", emitter, e);
                emitter.completeWithError(e);
            }
        }
    }


}
