ALTER TABLE `products` ADD `downloadPath` text;--> statement-breakpoint
ALTER TABLE `products` ADD `averageRating` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `reviewsCount` integer DEFAULT 0 NOT NULL;