-- ========================
-- Utilities table
-- ========================

CREATE TABLE IF NOT EXISTS utilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    electric_old INT DEFAULT 0,
    electric_new INT DEFAULT 0,
    electric_price DECIMAL(12, 2) NOT NULL,
    water_old INT DEFAULT 0,
    water_new INT DEFAULT 0,
    water_price DECIMAL(12, 2) NOT NULL,
    recorded_date DATE,
    note TEXT,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_month_year (room_id, month, year),
    INDEX idx_room_id (room_id),
    INDEX idx_month_year (month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
