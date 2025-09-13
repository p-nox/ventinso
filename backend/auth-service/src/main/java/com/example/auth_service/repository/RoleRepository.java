package com.example.auth_service.repository;

import com.example.auth_service.entity.Role;
import com.example.auth_service.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Role findByType(RoleType type);
}
