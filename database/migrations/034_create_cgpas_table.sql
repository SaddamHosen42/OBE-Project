-- Migration: Create cgpas table
-- Description: Stores cumulative GPA information for students

CREATE TABLE IF NOT EXISTS cgpas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    cgpa DOUBLE DEFAULT 0,
    total_credits DOUBLE DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_cgpa (student_id),
    INDEX idx_cgpas_student (student_id),
    INDEX idx_cgpas_cgpa (cgpa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
