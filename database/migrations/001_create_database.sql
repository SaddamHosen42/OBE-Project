-- Create OBE System Database
CREATE DATABASE IF NOT EXISTS obe_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE obe_system;

-- Verify database creation
SELECT 'Database obe_system created successfully!' AS message;
