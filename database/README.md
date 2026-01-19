# Database Setup Instructions

## Prerequisites
- MySQL Server installed and running
- Database user credentials configured

## Step 1: Create Database

Run the following command in MySQL:

```bash
mysql -u root -p < migrations/001_create_database.sql
```

Or connect to MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS obe_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

## Step 2: Verify Database

```sql
SHOW DATABASES;
USE obe_system;
```

## Migration Files

Migration files are located in the `migrations/` folder and should be executed in order:

1. `001_create_database.sql` - Creates the database
2. Future migration files will create tables and seed data

## Database Configuration

Database connection settings are configured in `backend/.env`:
- DB_HOST=localhost
- DB_USER=root
- DB_PASSWORD=admin1433
- DB_NAME=obe_system
- DB_PORT=3306
