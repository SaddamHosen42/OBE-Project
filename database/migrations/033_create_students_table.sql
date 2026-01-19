-- Migration: Create students table
-- Description: Stores student information and academic details

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    faculty_id BIGINT NOT NULL,
    degree_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    hall_id BIGINT NULL,
    SID VARCHAR(50) UNIQUE NOT NULL,
    batch_year INT NOT NULL,
    admission_date DATE NOT NULL,
    level VARCHAR(50),
    semester VARCHAR(50),
    session_year INT,
    residential_status VARCHAR(50),
    academic_status VARCHAR(50) DEFAULT 'Active',
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE RESTRICT,
    FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_user_student (user_id),
    INDEX idx_students_faculty (faculty_id),
    INDEX idx_students_degree (degree_id),
    INDEX idx_students_department (department_id),
    INDEX idx_students_sid (SID),
    INDEX idx_students_batch_year (batch_year),
    INDEX idx_students_academic_status (academic_status),
    CHECK (academic_status IN ('Active', 'Graduated', 'Suspended', 'Withdrawn'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
