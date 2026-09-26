CREATE TABLE `downloadTokens` (
	`token` text PRIMARY KEY NOT NULL,
	`orderItemId` integer NOT NULL,
	`productSlug` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`remainingUses` integer DEFAULT 10 NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
