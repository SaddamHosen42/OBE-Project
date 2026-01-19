-- Migration: 051_create_buildings_table.sql
-- Description: Create buildings table to store building/hall information
-- Dependencies: None

CREATE TABLE IF NOT EXISTS buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_name (name),
    INDEX idx_purpose (purpose)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO buildings (name, purpose) VALUES 
('Hall of Residence - A', 'Student Accommodation'),
('Hall of Residence - B', 'Student Accommodation'),
('Administrative Building', 'Administration'),
('Library Building', 'Academic'),
('Science Building', 'Academic');
