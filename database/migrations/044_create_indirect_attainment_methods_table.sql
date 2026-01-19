-- Create indirect_attainment_methods table
-- Defines indirect assessment methods for OBE attainment

CREATE TABLE indirect_attainment_methods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    method_name VARCHAR(100) NOT NULL COMMENT 'Course Exit Survey/Alumni Survey/Employer Survey',
    weight_percentage DOUBLE NOT NULL DEFAULT 0.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE CASCADE,
    
    INDEX idx_indirect_methods_degree (degree_id),
    INDEX idx_indirect_methods_name (method_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
