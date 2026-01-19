-- Migration: 009_create_degrees_table.sql
-- Description: Create degrees table to store degree program information
-- Dependencies: 007_create_faculties_table.sql, 008_create_departments_table.sql

CREATE TABLE IF NOT EXISTS degrees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    faculty_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    credit_hours VARCHAR(50) NULL,
    duration_years INT NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_degrees_faculty 
        FOREIGN KEY (faculty_id) 
        REFERENCES faculties(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_degrees_department 
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_name (name),
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO degrees (name, faculty_id, department_id, credit_hours, duration_years) VALUES 
('Bachelor of Science in Computer Science & Engineering', 3, 1, '160', 4),
('Bachelor of Science in Electrical & Electronic Engineering', 3, 2, '160', 4),
('Bachelor of Science in Mathematics', 1, 3, '120', 4),
('Bachelor of Arts in English', 2, 5, '120', 4),
('Bachelor of Business Administration', 4, 6, '128', 4);
