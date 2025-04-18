import { drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { accessTokensTable } from "../../drizzle/schema";
import { and, eq, lt } from "drizzle-orm";

type User = {
  id: string;
  username: string;
  provider: string;
};

export const enforce = createMiddleware<{
  Bindings: Env,
  Variables: {
    user: User;
  }
}>(async (c, next) => {
  const authorization = c.req.header("Authorization");
  const [type, token] = authorization?.split(" ") || [];
  if (type !== "Bearer" || !token) {
    throw new HTTPException(401);
  }
  // Validate token
  const [prefix, hash] = token.split("!");
  if (!prefix || !hash) {
    throw new HTTPException(401);
  }
  const db = drizzle(c.env.SDB);
  const ids = await db
    .select()
    .from(accessTokensTable)
    .where(and(eq(accessTokensTable.hash, prefix), eq(accessTokensTable.token, hash)));
  if (ids.length === 0) {
    throw new HTTPException(401);
  }
  // Extend expiration
  const user = ids[0];
  await db.update(accessTokensTable)
    .set({ expireAt: Date.now() + 30 * 86400 * 1000 });
  // cleanup expired tokens
  await db.delete(accessTokensTable)
    .where(lt(accessTokensTable.expireAt, Date.now()));
  // set user in context
  c.set("user", {
    id: user.id,
    username: user.username,
    provider: user.provider,
  });
  // chain requeset
  return next();
});
