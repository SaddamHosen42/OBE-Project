-- Simple Test Script for Continuous Improvement Tables (Step 2.10)
-- This script verifies table structure without requiring existing data

USE obe_database;

-- Display table structures
SELECT 'Checking action_plans table structure...' as Status;
DESCRIBE action_plans;

SELECT 'Checking action_plan_outcomes table structure...' as Status;
DESCRIBE action_plan_outcomes;

SELECT 'Checking obe_review_cycles table structure...' as Status;
DESCRIBE obe_review_cycles;

-- Check foreign key constraints
SELECT 'Checking foreign key constraints...' as Status;
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'obe_database'
AND TABLE_NAME IN ('action_plans', 'action_plan_outcomes', 'obe_review_cycles')
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Check indexes
SELECT 'Checking indexes...' as Status;
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'obe_database'
AND TABLE_NAME IN ('action_plans', 'action_plan_outcomes', 'obe_review_cycles')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Verify check constraints exist (MySQL 8.0.16+)
SELECT 'Checking constraints...' as Status;
SELECT 
    CONSTRAINT_SCHEMA,
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'obe_database'
AND TABLE_NAME IN ('action_plans', 'action_plan_outcomes', 'obe_review_cycles')
AND CONSTRAINT_TYPE = 'CHECK'
ORDER BY TABLE_NAME;

SELECT '✓ All Continuous Improvement Tables Created Successfully!' as Status;
SELECT 'Tables: action_plans, action_plan_outcomes, obe_review_cycles' as Summary;
