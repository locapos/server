import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { AccessTokenRepository, User } from "../repositories/AccessTokenRepository";

type AuthUser = User & { hash: string; };

export const enforce = createMiddleware<{
  Bindings: Env,
  Variables: {
    user: AuthUser;
  }
}>(async (c, next) => {
  const authorization = c.req.header("Authorization");
  const [type, token] = authorization?.split(" ") || [];
  if (type !== "Bearer" || !token) {
    throw new HTTPException(401);
  }
  // Validate token
  const [prefix, hash] = token.split(".");
  if (!prefix || !hash) {
    throw new HTTPException(401);
  }

  const tokenRepository = new AccessTokenRepository(c.env.SDB);

  // Cleanup expired tokens first
  await tokenRepository.deleteExpired();

  // Find token in database
  const accessToken = await tokenRepository.getByToken(prefix, hash);
  if (!accessToken) {
    throw new HTTPException(401);
  }

  // Extend expiration
  await tokenRepository.extendExpiration(prefix);

  // Set user in context
  c.set("user", {
    ...tokenRepository.mapToUser(accessToken),
    hash: prefix,
  });

  // Chain request
  return next();
});
