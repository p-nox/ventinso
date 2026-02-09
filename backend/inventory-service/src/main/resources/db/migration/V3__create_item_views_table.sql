CREATE TABLE item_views (
                            item_id BIGINT NOT NULL,
                            user_id BIGINT NOT NULL,
                            viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (item_id, user_id)
);
