package com.example.inventory_service.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemViewKey implements Serializable {

    private Long itemId;
    private Long userId;


    // equals & hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ItemViewKey)) return false;
        ItemViewKey that = (ItemViewKey) o;
        return Objects.equals(itemId, that.itemId) &&
                Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(itemId, userId);
    }
}
