CREATE TABLE IF NOT EXISTS f06_admins (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(254) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 created_at VARCHAR(24) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS f06_settings (
 id INT PRIMARY KEY,
 content LONGTEXT NOT NULL,
 updated_at VARCHAR(24) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS f06_orders (
 reference VARCHAR(20) PRIMARY KEY,
 idempotency_key CHAR(36) NOT NULL UNIQUE,
 token_hash CHAR(64) NOT NULL,
 input_hash CHAR(64) NOT NULL,
 name VARCHAR(100) NOT NULL,
 phone VARCHAR(20) NOT NULL,
 address VARCHAR(600) NOT NULL,
 area VARCHAR(20) NOT NULL,
 subtotal INT NOT NULL,
 delivery INT NOT NULL,
 total INT NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'received',
 payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
 created_at VARCHAR(24) NOT NULL,
 updated_at VARCHAR(24) NOT NULL,
 campaign TEXT NOT NULL,
 is_demo TINYINT NOT NULL DEFAULT 1,
 purchase_claimed TINYINT NOT NULL DEFAULT 0,
 INDEX f06_orders_created(created_at,reference),
 INDEX f06_orders_phone(phone,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS f06_rate_limits (
 bucket_key CHAR(64) PRIMARY KEY,
 hits INT UNSIGNED NOT NULL,
 expires_at BIGINT NOT NULL,
 INDEX f06_rate_expiry(expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS f06_setup (
 id INT PRIMARY KEY,
 completed_at VARCHAR(24) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
