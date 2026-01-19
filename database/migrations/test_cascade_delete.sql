-- Test CASCADE DELETE functionality

SELECT '===================' as '';
SELECT 'CASCADE DELETE TEST' as '';
SELECT '===================' as '';
SELECT '' as '';

-- Create a temporary test user
INSERT INTO users (name, email, username, password, role) 
VALUES (
    'Test User DELETE', 
    'delete.test@example.com', 
    'deletetest', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student'
);

SET @test_user_id = LAST_INSERT_ID();

-- Add address and gender for this user
INSERT INTO addresses (user_id, present_district, permanent_district) 
VALUES (@test_user_id, 'Test District', 'Test Permanent');

INSERT INTO genders (user_id, name) 
VALUES (@test_user_id, 'Other');

-- Verify records exist
SELECT 'Before Delete:' as Test;
SELECT COUNT(*) as user_count FROM users WHERE id = @test_user_id;
SELECT COUNT(*) as address_count FROM addresses WHERE user_id = @test_user_id;
SELECT COUNT(*) as gender_count FROM genders WHERE user_id = @test_user_id;

SELECT '' as '';

-- Delete the user
DELETE FROM users WHERE id = @test_user_id;

-- Verify cascade delete worked
SELECT 'After Delete:' as Test;
SELECT COUNT(*) as user_count FROM users WHERE id = @test_user_id;
SELECT COUNT(*) as address_count FROM addresses WHERE user_id = @test_user_id;
SELECT COUNT(*) as gender_count FROM genders WHERE user_id = @test_user_id;

SELECT '' as '';
SELECT '===================' as '';
SELECT 'CASCADE DELETE Test Completed!' as '';
SELECT 'All related records should be 0' as '';
SELECT '===================' as '';
