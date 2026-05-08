import { createHono } from "../lib/factory";
import { HTTPException } from "hono/http-exception";
import { hash, hmac } from "../lib/hashgen";
import {
  getOAuthClientSession,
  setOAuthClientSession,
  deleteOAuthClientSession,
  getOAuthUserSession,
  setOAuthUserSession,
  deleteOAuthUserSession
} from "../util/oauth-session";
import { ClientRepository } from "../repositories/ClientRepository";
import { AccessTokenRepository } from "../repositories/AccessTokenRepository";
import { Authorize } from "../views/oauth/Authorize";
import { Redirect } from "../views/oauth/Redirect";
import { Config } from "../views/oauth/Config";
import { Failed } from "../views/oauth/Failed";

const app = createHono();

app.get("/authorize", async (c) => {
  const responseType = c.req.query("response_type");
  const redirectUri = c.req.query("redirect_uri");
  const clientId = c.req.query("client_id");

  // Validate query parameters
  if (responseType !== "token") throw new HTTPException(400);
  if (!redirectUri) throw new HTTPException(400);
  if (!clientId) throw new HTTPException(400);

  // Validate client_id using ClientRepository
  const clientRepository = new ClientRepository(c.env.SDB);
  const client = await clientRepository.getById(clientId);
  if (!client) throw new HTTPException(400);

  await setOAuthClientSession(c, {
    client_id: clientId,
    redirect_uri: redirectUri,
    state: c.req.query("state"),
  });

  return c.html(<Authorize />);
});

app.get("/redirect", async (c) => {
  const user = await getOAuthUserSession(c);
  const session = await getOAuthClientSession(c);
  const uri = session?.redirect_uri;
  if (!user || !session || !uri) throw new HTTPException(400);

  const userHash = hmac(`${session.client_id}#${user.provider}:${user.id}`, c.env.CRYPTO_HASH_KEY);
  const tokenHash = hash();

  // Check existing token
  const tokenRepository = new AccessTokenRepository(c.env.SDB);
  const existingToken = await tokenRepository.getByHash(userHash);

  if (!existingToken) {
    // Create new token
    await tokenRepository.create({
      hash: userHash,
      token: tokenHash,
      clientId: session.client_id,
      provider: user.provider,
      id: user.id,
      username: user.name,
      defaultUsername: user.name,
      expireAt: Date.now() + 30 * 86400 * 1000,
    });
  } else {
    // Extend token expiration
    await tokenRepository.extendExpiration(userHash);
  }

  // drop session
  deleteOAuthClientSession(c);
  deleteOAuthUserSession(c);

  const state = encodeURIComponent(session.state || "");
  const accessToken = existingToken
    ? encodeURIComponent(`${userHash}.${existingToken.token}`)
    : encodeURIComponent(`${userHash}.${tokenHash}`);
  const redirectUri = `${uri}#access_token=${accessToken}&token_type=bearer&state=${state}`;

  return c.html(<Redirect redirectUri={redirectUri} />);
});

app.get("/config", async (c) => {
  const user = await getOAuthUserSession(c);
  if (!user) throw new HTTPException(400);
  return c.html(<Config />);
});

app.post("/config", async (c) => {
  const user = await getOAuthUserSession(c);
  if (!user) throw new HTTPException(400);
  const body = await c.req.parseBody();
  const username = body["username"] as string;
  if (!username) throw new HTTPException(400);
  await setOAuthUserSession(c, { ...user, name: username });
  return c.redirect("/oauth/redirect");
});

app.get("/failed", async (c) => {
  // drop session
  deleteOAuthClientSession(c);
  deleteOAuthUserSession(c);

  return c.html(<Failed />);
});

export { app as oauth };
