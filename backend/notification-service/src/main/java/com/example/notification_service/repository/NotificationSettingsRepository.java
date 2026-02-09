package com.example.notification_service.repository;

import com.example.notification_service.entity.NotificationSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationSettingsRepository extends MongoRepository<NotificationSettings, Long> {

    Optional<NotificationSettings> findByUserId(Long userId);
}