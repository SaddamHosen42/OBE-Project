-- Migration: 007_create_faculties_table.sql
-- Description: Create faculties table to store faculty information
-- Dependencies: None

CREATE TABLE IF NOT EXISTS faculties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_name (name),
    INDEX idx_short_name (short_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO faculties (name, short_name) VALUES 
('Faculty of Science', 'FoS'),
('Faculty of Arts', 'FoA'),
('Faculty of Engineering', 'FoE'),
('Faculty of Business Studies', 'FBS');
