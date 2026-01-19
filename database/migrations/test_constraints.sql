-- Additional tests for constraints and cascade operations

SELECT '===================' as '';
SELECT 'CONSTRAINT TESTS' as '';
SELECT '===================' as '';
SELECT '' as '';

-- Test 5: Try to insert duplicate gender for same user (should fail)
SELECT 'Test 5: Testing UNIQUE constraint on user_id in genders table' as Test;
INSERT INTO genders (user_id, name) 
VALUES (1, 'Female');

SELECT '' as '';
SELECT 'If you see this, the UNIQUE constraint failed!' as Result;
