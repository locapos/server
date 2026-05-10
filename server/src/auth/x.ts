import { HTTPException } from "hono/http-exception";
import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import {
  getOAuthProviderStateSession,
  setOAuthProviderStateSession,
  setOAuthUserSession,
} from "../util/oauth-session";

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  const code_verifier = hash();
  const code_challenge = hash(code_verifier);
  await setOAuthProviderStateSession(c, { state, code_verifier });
  const params = new URLSearchParams({
    response_type: "code",
    client_id: c.env.X_CLIENT_ID,
    redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/x/callback`,
    scope: "users.read",
    state,
    code_challenge,
    code_challenge_method: "S256",
  });
  return c.redirect(`https://twitter.com/i/oauth2/authorize?${params.toString()}`);
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");
  const remoteState = c.req.query("state");
  const stateSession = await getOAuthProviderStateSession(c);
  if (!stateSession || stateSession.state !== remoteState) {
    throw new HTTPException(400, { message: "Invalid state" });
  }
  if (!code || !stateSession.code_verifier) {
    throw new HTTPException(400, { message: "Missing code or verifier" });
  }
  const credentials = btoa(`${c.env.X_CLIENT_ID}:${c.env.X_CLIENT_SECRET}`);
  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/x/callback`,
      code_verifier: stateSession.code_verifier,
    }),
  });
  if (!tokenRes.ok) {
    throw new HTTPException(400, { message: "Failed to get token" });
  }
  const tokenJson = await tokenRes.json<{ access_token: string }>();
  const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=name,username", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!userRes.ok) {
    throw new HTTPException(400, { message: "Failed to get user info" });
  }
  const userJson = await userRes.json<{ data: { id: string; name: string; username: string } }>();
  const user = userJson.data;
  await setOAuthUserSession(c, {
    provider: "x",
    id: user.id,
    name: user.name || user.username || "",
  });
  return c.redirect("/oauth/redirect");
});

export { app as xAuth };
