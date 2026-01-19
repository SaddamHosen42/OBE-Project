# Run OBE Framework Migrations
# This script runs migrations 019-024 for OBE framework tables

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Running OBE Framework Table Migrations" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$DB_USER = "root"
$DB_NAME = "obe_db"
$MIGRATIONS_DIR = "D:\OBE Project\OBE-Project\database\migrations"

# Prompt for password securely
$SecurePassword = Read-Host "Enter MySQL password for user '$DB_USER'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for MySQL
$env:MYSQL_PWD = $DB_PASSWORD

$migrations = @(
    @{Number="019"; Name="bloom_taxonomy_levels"; File="019_create_bloom_taxonomy_levels_table.sql"},
    @{Number="020"; Name="program_educational_objectives"; File="020_create_program_educational_objectives_table.sql"},
    @{Number="021"; Name="program_learning_outcomes"; File="021_create_program_learning_outcomes_table.sql"},
    @{Number="022"; Name="peo_plo_mapping"; File="022_create_peo_plo_mapping_table.sql"},
    @{Number="023"; Name="course_learning_outcome_program_learning_outcome"; File="023_create_course_learning_outcome_program_learning_outcome_table.sql"},
    @{Number="024"; Name="clo_co_mapping"; File="024_create_clo_co_mapping_table.sql"}
)

$successCount = 0
$failCount = 0

for ($i = 0; $i -lt $migrations.Count; $i++) {
    $migration = $migrations[$i]
    $step = $i + 1
    $total = $migrations.Count
    
    Write-Host "[$step/$total] Creating $($migration.Name) table..." -ForegroundColor Yellow
    
    $filePath = Join-Path $MIGRATIONS_DIR $migration.File
    
    Get-Content $filePath | mysql -u $DB_USER $DB_NAME 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SUCCESS: $($migration.Name) table created" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "✗ ERROR: Failed to create $($migration.Name) table" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Migration Results: $successCount succeeded, $failCount failed" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "Running tests..." -ForegroundColor Yellow
    Write-Host ""
    
    $testFile = Join-Path $MIGRATIONS_DIR "test_obe_framework_tables.sql"
    Get-Content $testFile | mysql -u $DB_USER $DB_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All tests completed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Some tests may have failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "Migration Summary:" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    $query = "SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME IN ('bloom_taxonomy_levels', 'program_educational_objectives', 'program_learning_outcomes', 'peo_plo_mapping', 'course_learning_outcome_program_learning_outcome', 'clo_co_mapping') ORDER BY TABLE_NAME;"
    
    echo $query | mysql -u $DB_USER $DB_NAME
}

# Clear password from environment
$env:MYSQL_PWD = $null

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
