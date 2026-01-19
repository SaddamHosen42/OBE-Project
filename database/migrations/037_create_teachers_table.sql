-- Migration: Create teachers table
-- Description: Stores teacher information and academic details

CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    faculty_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    designation_id BIGINT NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    joining_date DATE NOT NULL,
    career_obj TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_user_teacher (user_id),
    INDEX idx_teachers_faculty (faculty_id),
    INDEX idx_teachers_department (department_id),
    INDEX idx_teachers_designation (designation_id),
    INDEX idx_teachers_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
