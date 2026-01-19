-- Migration: Create designations table
-- Description: Stores academic designations/positions for teachers

CREATE TABLE IF NOT EXISTS designations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    `rank` INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_designation_name (name),
    INDEX idx_designations_rank (`rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default designations
INSERT INTO designations (name, `rank`) VALUES 
('Professor', 1),
('Associate Professor', 2),
('Assistant Professor', 3),
('Lecturer', 4),
('Senior Lecturer', 5),
('Teaching Assistant', 6);
