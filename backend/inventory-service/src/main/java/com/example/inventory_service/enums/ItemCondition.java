package com.example.inventory_service.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemCondition {
    NEW,
    LIKE_NEW,
    USED;

    @JsonCreator
    public static ItemCondition from(String value) {
        return ItemCondition.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
