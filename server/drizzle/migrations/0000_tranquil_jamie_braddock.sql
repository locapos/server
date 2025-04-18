CREATE TABLE `access_tokens` (
	`hash` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`client_id` text NOT NULL,
	`username` text NOT NULL,
	`default_username` text NOT NULL,
	`id` text,
	`provider` text,
	`expire_at` integer
);
--> statement-breakpoint
CREATE TABLE `secrets` (
	`client_id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`appname` text,
	`author` text,
	`callback_uri` text
);
