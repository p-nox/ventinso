package com.example.user_service.enums;

public enum RatingValue {
    POOR(1),
    GOOD(2),
    VERY_GOOD(3),
    EXCELLENT(4);

    private final int score;

    RatingValue(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }

    public static RatingValue fromInt(int value) {
        return switch (value) {
            case 1 -> POOR;
            case 2 -> GOOD;
            case 3 -> VERY_GOOD;
            case 4 -> EXCELLENT;
            default -> throw new IllegalArgumentException("Invalid rating value: " + value);
        };
    }
}
