CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor INT,
    area DECIMAL(10, 2),
    price DECIMAL(12, 2) NOT NULL,
    deposit DECIMAL(12, 2) DEFAULT 0,
    status ENUM('available', 'rented', 'maintenance') DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES landlord(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_owner_room (owner_id, room_number),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS deposit DECIMAL(12, 2) DEFAULT 0 AFTER price;

UPDATE rooms
SET deposit = price * 2
WHERE deposit IS NULL OR deposit = 0;

INSERT INTO rooms (owner_id, room_number, floor, area, price, deposit, status, description) 
VALUES 
    (1, 'A101', 1, 25.5, 5000000, 10000000, 'available', 'Phòng một người, view đường phố'),
    (1, 'A102', 1, 30.0, 6500000, 13000000, 'rented', 'Phòng hai người, có cửa sổ'),
    (1, 'B201', 2, 28.0, 5500000, 11000000, 'maintenance', 'Phòng với ban công nhỏ'),
    (1, 'B202', 2, 35.0, 7000000, 14000000, 'available', 'Phòng rộng, 2 cửa sổ'),
    (1, 'C301', 3, 22.0, 4500000, 9000000, 'available', 'Phòng nhỏ gọn, giá rẻ')
ON DUPLICATE KEY UPDATE 
    price = VALUES(price),
    deposit = VALUES(deposit),
    status = VALUES(status);
