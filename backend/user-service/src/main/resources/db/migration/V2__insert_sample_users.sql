-- Insert initial users
INSERT INTO users (id, name, username, email, status, registered_at)
VALUES
    (1, 'Maria Papadopoulou', 'maria_p', 'maria.papado@example.com', 'ACTIVE', NOW()),
    (2, 'Nikos Georgiou', 'nikosg12', 'nikos.georgiou@example.com', 'ACTIVE', NOW()),
    (3, 'Eleni Kotsou', 'ekotsou', 'eleni.kotsou@example.com', 'ACTIVE', NOW()),
    (4, 'Katerina Vasileiou', 'kvasileiou', 'katerina.vas@example.com', 'ACTIVE', NOW()),
    (5, 'Dimitris Nikolaou', 'dnikolaou', 'd.nikolaou@example.com', 'ACTIVE', NOW()),
    (6, 'Giorgos Theodoridis', 'gtheo', 'giorgos.theo@example.com', 'ACTIVE', NOW());
