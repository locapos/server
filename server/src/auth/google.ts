import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import { getAuthState, setAuthUser, setAuthState } from "../util/auth-session";
import { HTTPException } from "hono/http-exception";

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setAuthState(c, state);
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/google/callback`,
    response_type: "code",
    scope: "profile",
    state,
    prompt: "consent"
  });
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
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
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/google/callback`,
      grant_type: "authorization_code"
    })
  });
  if (!tokenRes.ok) {
    throw new HTTPException(400, { message: "Failed to get token" });
  }
  const tokenJson = await tokenRes.json<{ access_token: string }>();
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });
  if (!userRes.ok) {
    throw new HTTPException(400, { message: "Failed to get user info" });
  }
  const user = await userRes.json<{ id: string; name?: string; email?: string }>();
  await setAuthUser(c, {
    provider: "google",
    id: user.id,
    name: user.name || user.email || ""
  });
  return c.redirect("/oauth/redirect");
});

export { app as googleAuth };