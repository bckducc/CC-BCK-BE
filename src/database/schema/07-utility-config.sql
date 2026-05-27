-- ========================
-- Utility Configuration table
-- ========================

CREATE TABLE IF NOT EXISTS utility_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    electric_price DECIMAL(10, 2) NOT NULL DEFAULT 3500.00 COMMENT 'VND per kWh',
    water_price DECIMAL(10, 2) NOT NULL DEFAULT 15000.00 COMMENT 'VND per cubic meter',
    vat_percent DECIMAL(5, 2) NOT NULL DEFAULT 10.00 COMMENT 'VAT percentage (0-100)',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NOT NULL COMMENT 'User ID of landlord who updated',
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configuration
-- Uses the first landlord user (admin) as the initial updater
INSERT INTO utility_config (electric_price, water_price, vat_percent, updated_by)
SELECT 3500.00, 15000.00, 10.00, id FROM users WHERE role = 'landlord' LIMIT 1
ON DUPLICATE KEY UPDATE id=id;
