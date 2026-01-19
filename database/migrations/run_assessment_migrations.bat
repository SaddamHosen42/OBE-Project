@echo off
REM Run Assessment Tables Migrations - Step 2.6
REM This script creates all assessment-related tables

echo ================================================
echo Running Assessment Tables Migrations (Step 2.6)
echo ================================================
echo.

set MYSQL_PWD=admin1433
set DB_NAME=obe_system
set DB_USER=root

echo [1/8] Creating assessment_types table...
mysql -u %DB_USER% %DB_NAME% < 025_create_assessment_types_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create assessment_types table
    pause
    exit /b 1
)
echo SUCCESS: assessment_types table created
echo.

echo [2/8] Creating assessment_components table...
mysql -u %DB_USER% %DB_NAME% < 026_create_assessment_components_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create assessment_components table
    pause
    exit /b 1
)
echo SUCCESS: assessment_components table created
echo.

echo [3/8] Creating assessment_clo_mapping table...
mysql -u %DB_USER% %DB_NAME% < 027_create_assessment_clo_mapping_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create assessment_clo_mapping table
    pause
    exit /b 1
)
echo SUCCESS: assessment_clo_mapping table created
echo.

echo [4/8] Creating rubrics table...
mysql -u %DB_USER% %DB_NAME% < 028_create_rubrics_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create rubrics table
    pause
    exit /b 1
)
echo SUCCESS: rubrics table created
echo.

echo [5/8] Creating rubric_criteria table...
mysql -u %DB_USER% %DB_NAME% < 029_create_rubric_criteria_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create rubric_criteria table
    pause
    exit /b 1
)
echo SUCCESS: rubric_criteria table created
echo.

echo [6/8] Creating rubric_levels table...
mysql -u %DB_USER% %DB_NAME% < 030_create_rubric_levels_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create rubric_levels table
    pause
    exit /b 1
)
echo SUCCESS: rubric_levels table created
echo.

echo [7/8] Creating questions table...
mysql -u %DB_USER% %DB_NAME% < 031_create_questions_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create questions table
    pause
    exit /b 1
)
echo SUCCESS: questions table created
echo.

echo [8/8] Creating question_clo_mapping table...
mysql -u %DB_USER% %DB_NAME% < 032_create_question_clo_mapping_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create question_clo_mapping table
    pause
    exit /b 1
)
echo SUCCESS: question_clo_mapping table created
echo.

echo ================================================
echo All Assessment Tables Created Successfully!
echo ================================================
echo.
echo Verifying tables...
mysql -u %DB_USER% %DB_NAME% -e "SHOW TABLES LIKE 'assessment%%'; SHOW TABLES LIKE 'rubric%%'; SHOW TABLES LIKE 'question%%';"

pause
