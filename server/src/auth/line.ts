import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import { getAuthState, setAuthUser, setAuthState } from "../util/auth-session";
import { HTTPException } from "hono/http-exception";

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setAuthState(c, state);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: c.env.LINE_CHANNEL_ID,
    redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/line/callback`,
    state,
    scope: "profile openid email"
  });
  return c.redirect(`https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");
  const remoteState = c.req.query("state");
  const state = await getAuthState(c);
  if (!state || state.state !== remoteState) {
    throw new HTTPException(400, { message: "Invalid state" });
  }
  if (!code) {
    throw new HTTPException(400, { message: "Missing code" });
  }
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/line/callback`,
      client_id: c.env.LINE_CHANNEL_ID,
      client_secret: c.env.LINE_CHANNEL_SECRET
    })
  });
  if (!tokenRes.ok) {
    throw new HTTPException(400, { message: "Failed to get token" });
  }
  const tokenJson = await tokenRes.json<{ access_token: string }>();
  const accessToken = tokenJson.access_token;
  const userRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!userRes.ok) {
    throw new HTTPException(400, { message: "Failed to get user info" });
  }
  const user = await userRes.json<{ userId: string; displayName?: string }>();
  await setAuthUser(c, {
    provider: "line",
    id: user.userId,
    name: user.displayName || ""
  });
  return c.redirect("/oauth/redirect");
});

export { app as lineAuth };