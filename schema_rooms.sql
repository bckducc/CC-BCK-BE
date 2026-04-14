-- ========================
-- Create ROOMS Table
-- ========================
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    area DECIMAL(8, 2) NOT NULL,
    floor INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('available', 'rented', 'maintenance') NOT NULL DEFAULT 'available',
    description TEXT,
    landlord_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (landlord_id) REFERENCES landlord(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_per_landlord (room_number, landlord_id),
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_status (status)
);

-- ========================
-- Insert Sample Data
-- ========================
-- Note: Replace landlord_id (1) with actual landlord ID from your database
INSERT INTO rooms (room_number, area, floor, price, status, description, landlord_id) 
VALUES 
    ('A101', 25.5, 1, 5000000, 'available', 'Phòng một người, view đường phố', 1),
    ('A102', 30.0, 1, 6500000, 'rented', 'Phòng hai người, có cửa sổ', 1),
    ('B201', 28.0, 2, 5500000, 'maintenance', 'Phòng với ban công nhỏ', 1),
    ('B202', 35.0, 2, 7000000, 'available', 'Phòng rộng, 2 cửa sổ', 1),
    ('C301', 22.0, 3, 4500000, 'available', 'Phòng nhỏ gọn, giá rẻ', 1)
ON DUPLICATE KEY UPDATE 
    price = VALUES(price),
    status = VALUES(status),
    updated_at = NOW();
