package com.example.chat_service.utils;

import com.example.chat_service.dto.MessageRequest;
import com.example.chat_service.dto.MessageResponse;
import com.example.chat_service.entity.Message;

@org.mapstruct.Mapper(componentModel = "spring")
public interface Mapper {

    Message toEntity(MessageRequest dto);

    MessageResponse toDto(Message entity);
}
