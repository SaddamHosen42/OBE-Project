-- Migration: Create addresses table
-- Description: Store present and permanent address information for users

CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    present_division VARCHAR(100) NULL,
    present_district VARCHAR(100) NULL,
    present_upazilla VARCHAR(100) NULL,
    present_area TEXT NULL,
    permanent_division VARCHAR(100) NULL,
    permanent_district VARCHAR(100) NULL,
    permanent_upazilla VARCHAR(100) NULL,
    permanent_area TEXT NULL,
    permanent_district_distance DOUBLE NULL COMMENT 'Distance from permanent district in km',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_addresses_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_user_id (user_id),
    INDEX idx_present_district (present_district),
    INDEX idx_permanent_district (permanent_district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
