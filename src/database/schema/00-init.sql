-- ========================
-- Create Database
-- ========================
CREATE DATABASE IF NOT EXISTS bck_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bck_manager;

-- ========================
-- Execute Schema Files in Order
-- ========================
-- 1. Users, Landlord, Tenant
SOURCE schema/01-users.sql;
-- 2. Rooms
SOURCE schema/00-rooms.sql;
-- 3. Contracts
SOURCE schema/02-contracts.sql;
-- 4. Services
SOURCE schema/03-services.sql;
-- 5. Utilities
SOURCE schema/04-utilities.sql;
-- 6. Invoices
SOURCE schema/05-invoices.sql;
-- 7. Notifications
SOURCE schema/06-notifications.sql;