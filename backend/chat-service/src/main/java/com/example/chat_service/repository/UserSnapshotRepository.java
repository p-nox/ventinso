package com.example.chat_service.repository;

import com.example.chat_service.entity.UserSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSnapshotRepository extends JpaRepository<UserSnapshot, Long> {


}
