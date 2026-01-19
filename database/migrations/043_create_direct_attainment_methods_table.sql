-- Create direct_attainment_methods table
-- Defines direct assessment methods for OBE attainment

CREATE TABLE direct_attainment_methods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_offering_id BIGINT NOT NULL,
    method_name VARCHAR(100) NOT NULL COMMENT 'Exam/Quiz/Assignment/Lab/Project',
    weight_percentage DOUBLE NOT NULL DEFAULT 0.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    
    INDEX idx_direct_methods_offering (course_offering_id),
    INDEX idx_direct_methods_name (method_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
