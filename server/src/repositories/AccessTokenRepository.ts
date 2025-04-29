import { and, eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { accessTokensTable } from "../../drizzle/schema";

export type AccessToken = {
  hash: string;
  token: string;
  clientId: string;
  username: string;
  defaultUsername: string;
  id: string;
  provider: string;
  expireAt: number;
};

export type User = {
  id: string;
  provider: string;
  username: string;
  default_username: string;
};

export class AccessTokenRepository {
  private db;

  constructor(d1Database: D1Database) {
    this.db = drizzle(d1Database);
  }

  async getByToken(hash: string, token: string): Promise<AccessToken | undefined> {
    const tokens = await this.db
      .select()
      .from(accessTokensTable)
      .where(and(eq(accessTokensTable.hash, hash), eq(accessTokensTable.token, token)));

    return tokens.length > 0 ? tokens[0] : undefined;
  }

  async getByHash(hash: string): Promise<AccessToken | undefined> {
    const tokens = await this.db
      .select()
      .from(accessTokensTable)
      .where(eq(accessTokensTable.hash, hash));

    return tokens.length > 0 ? tokens[0] : undefined;
  }

  async extendExpiration(hash: string, expirationDays: number = 30): Promise<void> {
    await this.db
      .update(accessTokensTable)
      .set({ expireAt: Date.now() + expirationDays * 86400 * 1000 })
      .where(eq(accessTokensTable.hash, hash));
  }

  async deleteExpired(): Promise<void> {
    await this.db.delete(accessTokensTable).where(lt(accessTokensTable.expireAt, Date.now()));
  }

  async create(accessToken: AccessToken): Promise<AccessToken> {
    await this.db.insert(accessTokensTable).values(accessToken);
    return accessToken;
  }

  async updateUsername(hash: string, username: string): Promise<void> {
    await this.db
      .update(accessTokensTable)
      .set({ username })
      .where(eq(accessTokensTable.hash, hash));
  }

  mapToUser(token: AccessToken): User {
    return {
      id: token.id,
      provider: token.provider,
      username: token.username,
      default_username: token.defaultUsername,
    };
  }
}
