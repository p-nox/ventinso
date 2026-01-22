-- V2__insert_initial_users.sql

-- Insert default roles if not exists
INSERT INTO roles (type)
VALUES
    ('ADMIN'),
    ('USER')
    ON DUPLICATE KEY UPDATE type = type;

-- Insert users
INSERT INTO users (username, password, email, status, registered_at)
VALUES
    ('maria_p', SHA2('Secret123!', 256), 'maria.papado@example.com', 'ACTIVE', NOW()),
    ('nikosg12', SHA2('NikosPass2024@', 256), 'nikos.georgiou@example.com', 'ACTIVE', NOW()),
    ('ekotsou', SHA2('EleniSecure88#', 256), 'eleni.kotsou@example.com', 'ACTIVE', NOW()),
    ('kvasileiou', SHA2('KVas#2025', 256), 'katerina.vas@example.com', 'ACTIVE', NOW()),
    ('dnikolaou', SHA2('DimiPass9@', 256), 'd.nikolaou@example.com', 'ACTIVE', NOW()),
    ('gtheo', SHA2('Theo_12345', 256), 'giorgos.theo@example.com', 'ACTIVE', NOW());

-- Map all users to USER role by default
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
         JOIN roles r ON r.type = 'USER'
WHERE u.username IN ('maria_p', 'nikosg12', 'ekotsou', 'kvasileiou', 'dnikolaou', 'gtheo')
    ON DUPLICATE KEY UPDATE user_id = user_id;

