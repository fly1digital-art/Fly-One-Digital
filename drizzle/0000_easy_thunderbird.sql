CREATE TABLE `orders` (
	`reference` text PRIMARY KEY NOT NULL,
	`idempotency_key` text NOT NULL,
	`token_hash` text NOT NULL,
	`input_hash` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`area` text NOT NULL,
	`subtotal` integer NOT NULL,
	`delivery` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`campaign` text DEFAULT '{}' NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	`purchase_claimed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_orders_phone_created` ON `orders` (`phone`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_created` ON `orders` (`created_at`);