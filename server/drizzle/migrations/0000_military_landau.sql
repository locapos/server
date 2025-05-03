CREATE TABLE `access_tokens` (
	`hash` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`client_id` text NOT NULL,
	`username` text NOT NULL,
	`default_username` text NOT NULL,
	`id` text NOT NULL,
	`provider` text NOT NULL,
	`expire_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `secrets` (
	`client_id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`appname` text NOT NULL,
	`author` text NOT NULL,
	`callback_uri` text DEFAULT '' NOT NULL
);
