-- Test script for addresses and genders tables
-- First, create a test user if it doesn't exist

-- Test 0: Create a test user
INSERT INTO users (name, email, username, password, role) 
VALUES (
    'John Doe', 
    'john.doe@example.com', 
    'johndoe', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'password'
    'student'
)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Test 1: Insert address for the test user
INSERT INTO addresses (
    user_id, 
    present_division, 
    present_district, 
    present_upazilla, 
    present_area, 
    permanent_division, 
    permanent_district, 
    permanent_upazilla, 
    permanent_area, 
    permanent_district_distance
) VALUES (
    @user_id, 
    'Dhaka', 
    'Dhaka', 
    'Mirpur', 
    'Block C, Road 5, House 42', 
    'Chittagong', 
    'Chittagong', 
    'Panchlaish', 
    'Ward 12, Area 3, House 15', 
    250.5
);

-- Test 2: Insert gender for the test user
INSERT INTO genders (user_id, name) 
VALUES (@user_id, 'Male');

-- Test 3: Verify data was inserted
SELECT '===================' as '';
SELECT 'TEST RESULTS' as '';
SELECT '===================' as '';
SELECT '' as '';

SELECT 'Addresses Table:' as Test;
SELECT 
    id,
    user_id,
    present_district,
    permanent_district,
    permanent_district_distance
FROM addresses;

SELECT '' as '';
SELECT 'Genders Table:' as Test;
SELECT * FROM genders;

-- Test 4: Verify foreign key relationship
SELECT '' as '';
SELECT 'Join Test - User with Address and Gender:' as Test;
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    g.name as gender,
    a.present_district,
    a.permanent_district,
    a.permanent_district_distance as distance_km
FROM users u
LEFT JOIN addresses a ON u.id = a.user_id
LEFT JOIN genders g ON u.id = g.user_id
WHERE u.id = @user_id;

SELECT '' as '';
SELECT '===================' as '';
SELECT 'Tests Completed Successfully!' as '';
SELECT '===================' as '';
