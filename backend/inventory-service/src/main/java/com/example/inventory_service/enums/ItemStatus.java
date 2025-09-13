package com.example.inventory_service.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemStatus {
    SOLD,
    ACTIVE,
    HIDDEN,
    RESERVED;

    @JsonCreator
    public static ItemStatus from(String value) {
        return ItemStatus.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
