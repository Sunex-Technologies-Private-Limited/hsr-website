ALTER TABLE `orders` ADD `accessToken` text;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_accessToken_unique` ON `orders` (`accessToken`);