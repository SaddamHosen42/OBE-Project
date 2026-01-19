@echo off
REM Run OBE Framework Migrations
REM This script runs migrations 019-024 for OBE framework tables

echo ================================================
echo Running OBE Framework Table Migrations
echo ================================================
echo.

SET DB_USER=root
SET DB_NAME=obe_db
SET MIGRATIONS_DIR=D:\OBE Project\OBE-Project\database\migrations

echo [1/6] Creating bloom_taxonomy_levels table...
mysql -u %DB_USER% -p %DB_NAME% < "%MIGRATIONS_DIR%\019_create_bloom_taxonomy_levels_table.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create bloom_taxonomy_levels table
    pause
    exit /b 1
)
echo SUCCESS: bloom_taxonomy_levels table created
echo.

echo [2/6] Creating program_educational_objectives table...
mysql -u %DB_USER% -p %DB_NAME% < "%MIGRATIONS_DIR%\020_create_program_educational_objectives_table.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create program_educational_objectives table
    pause
    exit /b 1
)
echo SUCCESS: program_educational_objectives table created
echo.

echo [3/6] Creating program_learning_outcomes table...
mysql -u %DB_USER% -p %DB_NAME% < "%MIGRATIONS_DIR%\021_create_program_learning_outcomes_table.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create program_learning_outcomes table
    pause
    exit /b 1
)
echo SUCCESS: program_learning_outcomes table created
echo.

echo [4/6] Creating peo_plo_mapping table...
mysql -u %DB_USER% -p %DB_NAME% < "%MIGRATIONS_DIR%\022_create_peo_plo_mapping_table.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create peo_plo_mapping table
    pause
    exit /b 1
)
echo SUCCESS: peo_plo_mapping table created
echo.

echo [5/6] Creating course_learning_outcome_program_learning_outcome table...
mysql -u %DB_USER% -p %DB_NAME% < "%MIGRATIONS_DIR%\023_create_course_learning_outcome_program_learning_outcome_table.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create course_learning_outcome_program_learning_outcome table
    pause
    exit /b 1
)
echo SUCCESS: course_learning_outcome_program_learning_outcome table created
echo.

echo [6/6] Creating clo_co_mapping table...
mysql -u %DB_USER% -p %DB_NAME% < "%MIGRATIONS_DIR%\024_create_clo_co_mapping_table.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create clo_co_mapping table
    pause
    exit /b 1
)
echo SUCCESS: clo_co_mapping table created
echo.

echo ================================================
echo All OBE Framework migrations completed!
echo ================================================
echo.
echo Running tests...
echo.

mysql -u %DB_USER% -p %DB_NAME% < "%MIGRATIONS_DIR%\test_obe_framework_tables.sql"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Some tests may have failed
) else (
    echo SUCCESS: All tests passed
)

echo.
echo ================================================
echo Migration Summary:
echo ================================================
mysql -u %DB_USER% -p %DB_NAME% -e "SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA='%DB_NAME%' AND TABLE_NAME IN ('bloom_taxonomy_levels', 'program_educational_objectives', 'program_learning_outcomes', 'peo_plo_mapping', 'course_learning_outcome_program_learning_outcome', 'clo_co_mapping') ORDER BY TABLE_NAME;"

pause
