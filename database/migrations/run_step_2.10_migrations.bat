@echo off
REM Step 2.10: Run Continuous Improvement Tables Migrations
REM This script creates action_plans, action_plan_outcomes, and obe_review_cycles tables

echo ================================================
echo Running Step 2.10: Continuous Improvement Tables
echo ================================================
echo.

set MYSQL_PWD=admin1433

echo [1/3] Creating action_plans table...
mysql -u root < 048_create_action_plans_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create action_plans table
    pause
    exit /b 1
)
echo ✓ action_plans table created successfully
echo.

echo [2/3] Creating action_plan_outcomes table...
mysql -u root < 049_create_action_plan_outcomes_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create action_plan_outcomes table
    pause
    exit /b 1
)
echo ✓ action_plan_outcomes table created successfully
echo.

echo [3/3] Creating obe_review_cycles table...
mysql -u root < 050_create_obe_review_cycles_table.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create obe_review_cycles table
    pause
    exit /b 1
)
echo ✓ obe_review_cycles table created successfully
echo.

echo ================================================
echo All Continuous Improvement tables created successfully!
echo ================================================
echo.
echo Tables created:
echo   - action_plans
echo   - action_plan_outcomes
echo   - obe_review_cycles
echo.

pause
