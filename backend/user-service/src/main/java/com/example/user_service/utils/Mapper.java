package com.example.user_service.utils;

import com.example.user_service.dto.*;
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

    @Mapping(target = "avatarUrl",source = "entity", qualifiedByName = "mapAvatarPath")
    UserSummaryResponse toUserSummaryView(User entity);

    FavoriteResponse toDto(Favorite entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "registeredAt", ignore = true)
    void updateUserFromDto(UpdateProfileRequest dto, @MappingTarget User entity);

    @Named("mapAvatarPath")
    default String mapAvatarPath(User entity) {
        if (entity.getAvatarUrl() == null || entity.getAvatarUrl().isEmpty()) return null;
        return "/api/users/" + Paths.get(entity.getAvatarUrl()).getFileName();
    }

}
