package com.example.user_service.repository;

import com.example.user_service.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndItemId(Long userId, Long itemId);

    List<Favorite> findAllByUserId(Long userId);

    @Query("SELECT f.user.id FROM Favorite f WHERE f.itemId = :itemId")
    List<Long> findUserIdsByItemId(Long itemId);

}
