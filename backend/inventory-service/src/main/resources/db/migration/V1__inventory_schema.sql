-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Table: items
CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(10000),
    price DECIMAL(19,2) NOT NULL,
    `condition` VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    ad_type VARCHAR(20) NOT NULL,
    views BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    watchers_count INT NOT NULL DEFAULT 0,
    open_to_offers BOOLEAN NOT NULL DEFAULT FALSE,
    pickup_by_appointment BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Table: item_images
CREATE TABLE IF NOT EXISTS item_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    thumbnail BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_item_images_item FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Table: item_reservations
CREATE TABLE IF NOT EXISTS item_reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    UNIQUE(item_id, order_id),
    CONSTRAINT fk_item_reservations_item FOREIGN KEY (item_id) REFERENCES items(id)
);
