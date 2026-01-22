CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant1_id BIGINT NOT NULL,
    participant2_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    last_message_id BIGINT,
    participant1Left BOOLEAN NOT NULL DEFAULT FALSE,
    participant2Left BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY unique_participants_item (participant1_id, participant2_id, item_id)
);
