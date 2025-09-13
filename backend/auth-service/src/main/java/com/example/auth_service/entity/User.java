package com.example.auth_service.entity;

import com.example.auth_service.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table( name = "users")
public class User {

    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    @Column( updatable = false)
    private Long id;

    @Column( nullable = false, unique = true)
    private String username;

    @Column( nullable = false)
    private String password;  //

    @Column( nullable = false, unique = true)
    private String email;   //

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @CreationTimestamp
    @Column( name = "registered_at",nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @Column( name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns =  @JoinColumn(name = "role_id", referencedColumnName = "id"))
    private Set<Role> roles;

    @PreUpdate
    protected void onUpdate() {
        updatedAt =  LocalDateTime.now();
    }

}