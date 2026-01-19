-- Migration: Create genders table
-- Description: Store gender information for users

CREATE TABLE IF NOT EXISTS genders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name ENUM('Male', 'Female', 'Other', 'Prefer not to say') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_genders_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_user_id (user_id),
    INDEX idx_name (name),
    
    -- Ensure one gender record per user
    UNIQUE KEY uk_user_gender (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
