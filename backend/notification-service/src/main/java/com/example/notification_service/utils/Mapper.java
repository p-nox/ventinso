package com.example.notification_service.utils;

import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.entity.Notification;
import org.mapstruct.NullValuePropertyMappingStrategy;

@org.mapstruct.Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface Mapper {

    NotificationResponse toDto(Notification entity);

}
