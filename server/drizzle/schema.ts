import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import app from "../src";

export const secrets = sqliteTable("secrets", {
  clientId: text("client_id").primaryKey().notNull(),
  secret: text("secret").notNull(),
  appname: text("appname"),
  author: text("author"),
  callbackUri: text("callback_uri"),
});

export const accessTokens = sqliteTable("access_tokens", {
  hash: text("hash").primaryKey().notNull(),
  token: text("token").notNull(),
  clientId: text("client_id").notNull(),
  username: text("username").notNull(),
  defaultUsername: text("default_username").notNull(),
  id: text("id"),
  provider: text("provider"),
  expireAt: integer("expire_at"),
});