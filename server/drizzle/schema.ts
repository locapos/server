import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const secretsTable = sqliteTable("secrets", {
  clientId: text("client_id").primaryKey().notNull(),
  secret: text("secret").notNull(),
  appname: text("appname").notNull(),
  author: text("author").notNull(),
  callbackUri: text("callback_uri").notNull().default(""),
});

export const accessTokensTable = sqliteTable("access_tokens", {
  hash: text("hash").primaryKey().notNull(),
  token: text("token").notNull(),
  clientId: text("client_id").notNull(),
  username: text("username").notNull(),
  defaultUsername: text("default_username").notNull(),
  id: text("id").notNull(),
  provider: text("provider").notNull(),
  expireAt: integer("expire_at").notNull(),
});