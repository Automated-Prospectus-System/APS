#!/usr/bin/env bash
# Run this ONCE with sudo to set up MySQL for APES
# Usage: sudo bash setup_db.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/Database"

echo "=== APES Database Setup ==="

# Create apes_user with password
mysql <<'MYSQL'
SET GLOBAL validate_password.policy = LOW;
SET GLOBAL validate_password.length = 6;
CREATE DATABASE IF NOT EXISTS apes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'apes_user'@'localhost' IDENTIFIED BY 'apes_pass_2026';
GRANT ALL PRIVILEGES ON apes_system.* TO 'apes_user'@'localhost';
FLUSH PRIVILEGES;
MYSQL

echo "[✓] MySQL user 'apes_user' created."

# Run schema as root (schema contains DROP/CREATE DATABASE)
mysql < "$DB_DIR/schema.sql"
echo "[✓] Schema created."

# Re-grant after schema recreates the DB
mysql <<'MYSQL2'
GRANT ALL PRIVILEGES ON apes_system.* TO 'apes_user'@'localhost';
FLUSH PRIVILEGES;
MYSQL2

# Run seed as apes_user
mysql -u apes_user -papes_pass_2026 apes_system < "$DB_DIR/seed.sql"
echo "[✓] Seed data loaded."

echo ""
echo "=== Done! ==="
echo "Database: apes_system"
echo "User:     apes_user"
echo "Password: apes_pass_2026"
