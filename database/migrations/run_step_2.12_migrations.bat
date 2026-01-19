@echo off
echo Running Step 2.12: Infrastructure Tables Migrations...
echo ============================================

set MYSQL_PWD=admin1433

echo.
echo [1/4] Creating buildings table...
mysql -u root -D obe_system < 051_create_buildings_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create buildings table
    pause
    exit /b 1
)
echo SUCCESS: buildings table created

echo.
echo [2/4] Creating floors table...
mysql -u root -D obe_system < 052_create_floors_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create floors table
    pause
    exit /b 1
)
echo SUCCESS: floors table created

echo.
echo [3/4] Creating rooms table...
mysql -u root -D obe_system < 053_create_rooms_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create rooms table
    pause
    exit /b 1
)
echo SUCCESS: rooms table created

echo.
echo [4/4] Creating seat_allocations table...
mysql -u root -D obe_system < 054_create_seat_allocations_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create seat_allocations table
    pause
    exit /b 1
)
echo SUCCESS: seat_allocations table created

echo.
echo ============================================
echo All Infrastructure Tables migrations completed successfully!
echo ============================================

pause
