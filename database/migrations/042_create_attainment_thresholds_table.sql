-- Create attainment_thresholds table
-- Defines threshold levels for outcome attainment evaluation

CREATE TABLE attainment_thresholds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT NOT NULL,
    threshold_type VARCHAR(20) NOT NULL COMMENT 'CLO/PLO/PEO',
    level_name VARCHAR(50) NOT NULL COMMENT 'Exceeded/Met/Approaching/Not Met',
    min_percentage DOUBLE NOT NULL,
    max_percentage DOUBLE NOT NULL,
    is_attained BOOLEAN DEFAULT FALSE COMMENT 'Whether this level indicates successful attainment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE CASCADE,
    
    INDEX idx_attainment_thresholds_degree (degree_id),
    INDEX idx_attainment_thresholds_type (threshold_type),
    INDEX idx_attainment_thresholds_level (level_name),
    UNIQUE KEY unique_degree_type_level (degree_id, threshold_type, level_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
