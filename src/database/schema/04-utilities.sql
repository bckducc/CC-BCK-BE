CREATE TABLE IF NOT EXISTS utilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
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

    CONSTRAINT fk_utilities_contract FOREIGN KEY (contract_id) REFERENCES contracts(id),
    INDEX idx_contract_id (contract_id),
    INDEX idx_month_year (month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
