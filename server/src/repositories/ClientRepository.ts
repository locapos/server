import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { secretsTable } from "../../drizzle/schema";

export type Client = {
  clientId: string;
  secret: string;
  appname: string;
  author: string;
  callbackUri: string;
};

export class ClientRepository {
  private db;

  constructor(d1Database: D1Database) {
    this.db = drizzle(d1Database);
  }

  async getById(clientId: string): Promise<Client | undefined> {
    const results = await this.db
      .select()
      .from(secretsTable)
      .where(eq(secretsTable.clientId, clientId));

    return results.length > 0 ? results[0] : undefined;
  }
}
