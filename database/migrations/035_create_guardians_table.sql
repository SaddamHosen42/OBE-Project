-- Migration: Create guardians table
-- Description: Stores guardian information for students

CREATE TABLE IF NOT EXISTS guardians (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    father_name VARCHAR(255),
    father_phone VARCHAR(20),
    mother_name VARCHAR(255),
    mother_phone VARCHAR(20),
    father_nid VARCHAR(50),
    mother_nid VARCHAR(50),
    guardian_occupation VARCHAR(255),
    income_per_year DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_guardian (student_id),
    INDEX idx_guardians_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
