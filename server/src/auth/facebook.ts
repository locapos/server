import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import { getAuthState, setAuthUser, setAuthState } from "../util/auth-session";
import { HTTPException } from "hono/http-exception";

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setAuthState(c, state);
  const params = new URLSearchParams({
    client_id: c.env.FACEBOOK_CLIENT_ID,
    redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/facebook/callback`,
    state,
    response_type: "code",
    scope: "public_profile email"
  });
  return c.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`);
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
  const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: c.env.FACEBOOK_CLIENT_ID,
      client_secret: c.env.FACEBOOK_CLIENT_SECRET,
      redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/facebook/callback`,
      code
    }), {
    method: "GET"
  });
  if (!tokenRes.ok) {
    throw new HTTPException(400, { message: "Failed to get token" });
  }
  const tokenJson = await tokenRes.json<{ access_token: string }>();
  const accessToken = tokenJson.access_token;
  const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
  if (!userRes.ok) {
    throw new HTTPException(400, { message: "Failed to get user info" });
  }
  const user = await userRes.json<{ id: string; name?: string; email?: string }>();
  await setAuthUser(c, {
    provider: "facebook",
    id: user.id,
    name: user.name || user.email || ""
  });
  return c.redirect("/oauth/redirect");
});

export { app as facebookAuth };