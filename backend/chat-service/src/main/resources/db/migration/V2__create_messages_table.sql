CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    is_read_by_receiver BOOLEAN NOT NULL DEFAULT FALSE,
    content TEXT,
    message_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat FOREIGN KEY (chat_id)
        REFERENCES chat_messages(id)
        ON DELETE CASCADE
);
