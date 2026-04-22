-- ========================
-- Services tables
-- ========================

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20),
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_service_name (service_name),
    INDEX idx_is_optional (is_optional)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Room services (services assigned to specific rooms)
CREATE TABLE IF NOT EXISTS room_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    applied_date DATE DEFAULT (CURRENT_DATE),
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_service (room_id, service_id),
    INDEX idx_room_id (room_id),
    INDEX idx_service_id (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
