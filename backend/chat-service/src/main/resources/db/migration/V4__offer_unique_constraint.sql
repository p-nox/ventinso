ALTER TABLE messages
    ADD COLUMN offer_chat_id BIGINT
        GENERATED ALWAYS AS (
            CASE
                WHEN message_type = 'OFFER' THEN chat_id
                WHEN message_type = 'COUNTER' THEN chat_id
                ELSE NULL
                END
            ) VIRTUAL;

CREATE UNIQUE INDEX uniq_offer_per_chat
    ON messages (offer_chat_id);
