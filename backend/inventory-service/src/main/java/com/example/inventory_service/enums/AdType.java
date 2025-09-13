package com.example.inventory_service.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AdType {
    BUY,
    SELL,
    AUCTION;


    @JsonCreator
    public static AdType from(String value) {
        return AdType.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }

}
