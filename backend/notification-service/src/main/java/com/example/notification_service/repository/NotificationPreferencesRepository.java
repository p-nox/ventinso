package com.example.notification_service.repository;

import com.example.notification_service.entity.NotificationPreferences;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationPreferencesRepository extends MongoRepository<NotificationPreferences, Long> {
}