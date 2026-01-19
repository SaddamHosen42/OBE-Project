-- Migration: 008_create_departments_table.sql
-- Description: Create departments table to store department information
-- Dependencies: 007_create_faculties_table.sql

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dept_code VARCHAR(20) NOT NULL,
    faculty_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_departments_faculty 
        FOREIGN KEY (faculty_id) 
        REFERENCES faculties(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_dept_code (dept_code),
    INDEX idx_name (name),
    INDEX idx_faculty_id (faculty_id),
    
    -- Unique constraint for department code
    UNIQUE KEY uk_dept_code (dept_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO departments (name, dept_code, faculty_id) VALUES 
('Computer Science & Engineering', 'CSE', 3),
('Electrical & Electronic Engineering', 'EEE', 3),
('Mathematics', 'MATH', 1),
('Physics', 'PHY', 1),
('English', 'ENG', 2),
('Accounting & Information Systems', 'AIS', 4);
