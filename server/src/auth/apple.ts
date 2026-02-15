import { createHono } from "../lib/factory";
import { hash, hmac } from "../lib/hashgen";
import {
  getOAuthClientSession,
  getOAuthProviderStateSession,
  setOAuthUserSession,
  setOAuthProviderStateSession,
} from "../util/oauth-session";
import { AccessTokenRepository } from "../repositories/AccessTokenRepository";
import { HTTPException } from "hono/http-exception";
import { createPrivateKey, sign } from "node:crypto";

function generateAppleClientSecret(env: Env): string {
  const header = { alg: "ES256", kid: env.APPLE_KEY_ID };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 300,
    aud: "https://appleid.apple.com",
    sub: env.APPLE_CLIENT_ID,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const headerEncoded = encode(header);
  const payloadEncoded = encode(payload);
  const signingInput = `${headerEncoded}.${payloadEncoded}`;

  const privateKeyPem = Buffer.from(env.APPLE_PRIVATE_KEY, "base64").toString("utf-8");
  const key = createPrivateKey({ key: privateKeyPem, format: "pem" });
  const signature = sign("sha256", Buffer.from(signingInput), {
    key,
    dsaEncoding: "ieee-p1363",
  });

  return `${signingInput}.${signature.toString("base64url")}`;
}

function decodeJwtPayload<T>(jwt: string): T {
  const parts = jwt.split(".");
  if (parts.length !== 3) {
    throw new HTTPException(400, { message: "Invalid id_token format" });
  }
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as T;
}

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setOAuthProviderStateSession(c, { state });
  const params = new URLSearchParams({
    client_id: c.env.APPLE_CLIENT_ID,
    redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/apple/callback`,
    response_type: "code",
    response_mode: "query",
    scope: "name",
    state,
  });
  return c.redirect(`https://appleid.apple.com/auth/authorize?${params.toString()}`);
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");
  const remoteState = c.req.query("state");
  const stateSession = await getOAuthProviderStateSession(c);
  if (!stateSession || stateSession.state !== remoteState) {
    throw new HTTPException(400, { message: "Invalid state" });
  }
  if (!code) {
    throw new HTTPException(400, { message: "Missing code" });
  }

  const clientSecret = generateAppleClientSecret(c.env);
  const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.env.APPLE_CLIENT_ID,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/apple/callback`,
    }),
  });
  if (!tokenRes.ok) {
    throw new HTTPException(400, { message: "Failed to get token" });
  }
  const tokenJson = await tokenRes.json<{ id_token: string }>();

  const idTokenPayload = decodeJwtPayload<{
    sub: string;
    email?: string;
  }>(tokenJson.id_token);

  await setOAuthUserSession(c, {
    provider: "apple",
    id: idTokenPayload.sub,
    name: idTokenPayload.email || "",
  });

  // Check if existing token exists for this Apple user
  const clientSession = await getOAuthClientSession(c);
  if (!clientSession) {
    throw new HTTPException(400, { message: "Missing client session" });
  }
  const userHash = hmac(
    `${clientSession.client_id}#apple:${idTokenPayload.sub}`,
    c.env.CRYPTO_HASH_KEY,
  );
  const tokenRepository = new AccessTokenRepository(c.env.SDB);
  const existingToken = await tokenRepository.getByHash(userHash);

  if (existingToken) {
    return c.redirect("/oauth/redirect");
  }
  return c.redirect("/oauth/config");
});

export { app as appleAuth };
