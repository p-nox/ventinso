package com.example.auth_service.utils;

import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.entity.User;

@org.mapstruct.Mapper(componentModel = "spring")
public interface Mapper {
   AuthResponse toDto(User entity);
}
