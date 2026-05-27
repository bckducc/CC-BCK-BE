-- ========================
-- BCK Manager - Apply Schema Script
-- ========================
-- This script applies all schema changes to the database
-- Run this file to create or update all tables
-- ========================

-- Option 1: Fresh Install (Drop all tables and recreate)
-- Uncomment the following lines to drop all tables first
/*
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS utilities;
DROP TABLE IF EXISTS utility_config;
DROP TABLE IF EXISTS room_services;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS tenant;
DROP TABLE IF EXISTS landlord;
DROP TABLE IF EXISTS users;
*/

-- Option 2: Update Existing Database (Recommended)
-- Run each schema file in order

-- Step 1: Create users, landlord, tenant tables
SOURCE src/database/schema/01-users.sql;

-- Step 2: Create rooms table
SOURCE src/database/schema/00-rooms.sql;

-- Step 3: Create contracts table
SOURCE src/database/schema/02-contracts.sql;

-- Step 4: Create services and room_services tables
SOURCE src/database/schema/03-services.sql;

-- Step 5: Create utilities table
SOURCE src/database/schema/04-utilities.sql;

-- Step 6: Create invoices and payments tables
SOURCE src/database/schema/05-invoices.sql;

-- Step 7: Create notifications table
SOURCE src/database/schema/06-notifications.sql;

-- Step 8: Create utility_config table
SOURCE src/database/schema/07-utility-config.sql;

-- ========================
-- Verification Queries
-- ========================
-- Run these queries to verify the schema was applied correctly

-- Show all tables
SHOW TABLES;

-- Verify foreign key relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    REFERENCED_TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY
    TABLE_NAME, COLUMN_NAME;

-- Count records in each table
SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL
SELECT 'landlord', COUNT(*) FROM landlord
UNION ALL
SELECT 'tenant', COUNT(*) FROM tenant
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'room_services', COUNT(*) FROM room_services
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 'utilities', COUNT(*) FROM utilities
UNION ALL
SELECT 'utility_config', COUNT(*) FROM utility_config
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
