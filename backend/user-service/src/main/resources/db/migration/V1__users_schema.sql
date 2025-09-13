-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url VARCHAR(255) DEFAULT '579b142c-fa2c-4857-a10c-80d9d9ad4a7a.png',
    status VARCHAR(50) NOT NULL,
    total_sales INT DEFAULT 0,
    average_delivery_time BIGINT DEFAULT 0,
    avg_description_rating DOUBLE DEFAULT 0.0,
    avg_packaging_rating DOUBLE DEFAULT 0.0,
    avg_condition_rating DOUBLE DEFAULT 0.0,
    avg_overall_rating DOUBLE DEFAULT 0.0,
    total_ratings INT DEFAULT 0,
    registered_at DATETIME NOT NULL
);

-- Favorites table
CREATE TABLE favourites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    CONSTRAINT uc_user_item UNIQUE (user_id, item_id),
    CONSTRAINT fk_favourites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ratings table
CREATE TABLE ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    listing_description VARCHAR(50) NOT NULL,
    listing_packaging VARCHAR(50) NOT NULL,
    listing_condition VARCHAR(50) NOT NULL,
    total_rating INT NOT NULL,
    comment VARCHAR(1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ratings_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_ratings_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id)
);

-- Wallets table
CREATE TABLE wallets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    balance DECIMAL(19,2) NOT NULL DEFAULT 0,
    reserved_balance DECIMAL(19,2) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id)
);
