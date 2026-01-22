-- Insert UserSnapshots
INSERT INTO user_snapshots (user_id, avatar_url)
VALUES
    (1, '/api/users/40d63e9e-921a-41ba-bb5f-05613698809b.jpg'),
    (2, '/api/users/7b607ecb-2757-4c6f-8faa-7e286940dafb.jpg'),
    (3, '/api/users/45dcfe4b-d70e-4cc9-9b29-ca1d40b7887a.jpg'),
    (4, '/api/users/6284a695-4abf-4745-a277-d372acb7418a.jpg'),
    (5, '/api/users/fee7f9b6-9671-407e-bbe1-51940b8b46e5.jpg'),
    (6, '/api/users/96389dd2-0c12-4eb4-b3c6-e3207f848150.png');

-- Insert Chat Records
INSERT INTO chat_messages (id, participant1_id, participant2_id, item_id, last_message_id)
VALUES
    (1, 1, 2, 101, NULL),
    (2, 1, 3, 102, NULL),
    (3, 2, 3, 103, NULL),
    (4, 4, 5, 104, NULL),
    (5, 5, 6, 105, NULL);

-- Insert Messages with explicit IDs
INSERT INTO messages (id, chat_id, sender_id, content, message_type, is_read_by_receiver)
VALUES
    -- Chat 1
    (1, 1, 1, 'Hey, how are you?', 'TEXT', TRUE),
    (2, 1, 2, 'I am good, thanks!', 'TEXT', FALSE),
    (3, 1, 1, 'Want to meet later?', 'TEXT', TRUE),

    -- Chat 2
    (4, 2, 1, 'Hello!', 'TEXT', TRUE),
    (5, 2, 3, 'Hi there!', 'TEXT', FALSE),

    -- Chat 3
    (6, 3, 2, 'Random chat message', 'TEXT', TRUE),

    -- Chat 4
    (7, 4, 4, 'Hey 5, ready?', 'TEXT', TRUE),
    (8, 4, 5, 'Yes, let’s go!', 'TEXT', FALSE),

    -- Chat 5
    (9, 5, 5, 'Hello 6', 'TEXT', TRUE),
    (10, 5, 6, 'Hi 5', 'TEXT', FALSE);

-- Update last_message_id in chat_messages
UPDATE chat_messages SET last_message_id = 3 WHERE id = 1;
UPDATE chat_messages SET last_message_id = 5 WHERE id = 2;
UPDATE chat_messages SET last_message_id = 6 WHERE id = 3;
UPDATE chat_messages SET last_message_id = 8 WHERE id = 4;
UPDATE chat_messages SET last_message_id = 10 WHERE id = 5;
