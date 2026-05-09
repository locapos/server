import { bearerAuth } from "hono/bearer-auth";
import { createMiddleware } from "hono/factory";
import { publicUserId } from "../lib/hashgen";
import { AccessTokenRepository, type User } from "../repositories/AccessTokenRepository";

type AuthUser = User & { hash: string };

export const enforce = createMiddleware<{
  Bindings: Env;
  Variables: {
    user: AuthUser;
  };
}>(
  bearerAuth({
    async verifyToken(token, c) {
      // Validate token
      const [prefix, hash] = token.split(".");
      if (!prefix || !hash) return false;
      const tokenRepository = new AccessTokenRepository(c.env.SDB);
      // Cleanup expired tokens first
      await tokenRepository.deleteExpired();
      // Find token in database
      const accessToken = await tokenRepository.getByToken(prefix, hash);
      if (!accessToken) return false;
      // Extend expiration
      await tokenRepository.extendExpiration(prefix);
      // Set user in context
      c.set("user", {
        ...tokenRepository.mapToUser(accessToken, publicUserId(c.env, accessToken)),
        hash: prefix,
      });
      // Chain request
      return true;
    },
  })
);
