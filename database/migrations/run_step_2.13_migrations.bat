@echo off
REM Run Step 2.13 migrations: Reports & Audit Tables
REM Date: 2026-01-19

echo ======================================
echo Running Step 2.13 Migrations
echo Reports and Audit Tables
echo ======================================
echo.

REM Set MySQL credentials
set MYSQL_USER=root
set MYSQL_PASSWORD=admin1433
set MYSQL_HOST=localhost
set MYSQL_PORT=3306

REM Migration files
set MIGRATION_DIR=.

echo [1/3] Creating obe_reports table...
mysql -u%MYSQL_USER% -p%MYSQL_PASSWORD% -h%MYSQL_HOST% -P%MYSQL_PORT% < %MIGRATION_DIR%\055_create_obe_reports_table.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create obe_reports table
    pause
    exit /b 1
)
echo SUCCESS: obe_reports table created
echo.

echo [2/3] Creating audit_logs table...
mysql -u%MYSQL_USER% -p%MYSQL_PASSWORD% -h%MYSQL_HOST% -P%MYSQL_PORT% < %MIGRATION_DIR%\056_create_audit_logs_table.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create audit_logs table
    pause
    exit /b 1
)
echo SUCCESS: audit_logs table created
echo.

echo [3/3] Creating result_publications table...
mysql -u%MYSQL_USER% -p%MYSQL_PASSWORD% -h%MYSQL_HOST% -P%MYSQL_PORT% < %MIGRATION_DIR%\057_create_result_publications_table.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create result_publications table
    pause
    exit /b 1
)
echo SUCCESS: result_publications table created
echo.

echo ======================================
echo All Step 2.13 migrations completed successfully!
echo ======================================
echo.
pause
