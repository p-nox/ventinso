package com.example.notification_service.service;

import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.entity.Notification;
import com.example.notification_service.exception.ResourceNotFoundException;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.utils.Mapper;
import com.mongodb.client.result.UpdateResult;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final MongoTemplate mongoTemplate;
    private final Mapper mapper;

    @Override
    public NotificationResponse saveNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        return mapper.toDto(saved);
    }

    @Override
    public List<NotificationResponse> saveNotifications(List<Notification> notifications) {
        List<Notification> saved = notificationRepository.saveAll(notifications);
        return convertToDtoList(saved);
    }

    @Override
    public List<NotificationResponse> getAllUserNotifications(Long userId) {
        Query query = new Query(Criteria.where("userId").is(userId));
        query.addCriteria(Criteria.where("isRead").is(false));
        query.with(Sort.by(Sort.Order.desc("createdAt")));

        List<Notification> notifications = mongoTemplate.find(query, Notification.class);
        return convertToDtoList(notifications);
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.
                findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return convertToDtoList(notifications);
    }

    @Override
    public void markAsRead(String notificationId) {
        Query query = new Query(Criteria.where("id").is(notificationId));
        Update update = new Update().set("isRead", true);
        UpdateResult result = mongoTemplate.updateFirst(query, update, Notification.class);

        if (result.getMatchedCount() == 0) {
            throw new ResourceNotFoundException("Notification with id " + notificationId + " doesn't exist!");
        }
    }

    @Override
    public void markAllAsRead(Long userId) {
        Query query = new Query(Criteria.where("userId").is(userId).and("isRead").is(false));
        Update update = new Update().set("isRead", true);
        mongoTemplate.updateMulti(query, update, Notification.class);
    }


    private List<NotificationResponse> convertToDtoList(List<Notification> notifications){
        return  notifications.stream().map(mapper::toDto).toList();
    }

}
