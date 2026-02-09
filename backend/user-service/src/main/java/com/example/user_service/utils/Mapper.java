package com.example.user_service.utils;

import com.example.user_service.dto.request.UpdateProfileRequest;
import com.example.user_service.dto.response.FavoriteResponse;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.dto.response.UserSummaryResponse;
import com.example.user_service.entity.Favorite;
import com.example.user_service.entity.User;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.nio.file.Paths;

@org.mapstruct.Mapper(componentModel = "spring")
public interface Mapper {

    @Mapping(target = "avatarUrl",source = "entity", qualifiedByName = "mapAvatarPath")
    UserResponse toDto(User entity);

    @Mapping(source = "id", target = "userId")
    @Mapping(target = "avatarUrl",source = "entity", qualifiedByName = "mapAvatarPath")
    UserSummaryResponse toUserSummaryView(User entity);

    FavoriteResponse toDto(Favorite entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registeredAt", ignore = true)
    void updateUserFromDto(UpdateProfileRequest dto, @MappingTarget User entity);

    @Named("mapAvatarPath")
    default String mapAvatarPath(User entity) {
        if (entity.getAvatarUrl() == null || entity.getAvatarUrl().isEmpty()) return null;
        return entity.getAvatarUrl();
    }

}
