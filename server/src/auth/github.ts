import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import { getOAuthProviderStateSession, setOAuthUserSession, setOAuthProviderStateSession } from "../util/oauth-session";
import { HTTPException } from "hono/http-exception";

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setOAuthProviderStateSession(c, { state });
  const params = new URLSearchParams({
    client_id: c.env.GITHUB_CLIENT_ID,
    redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/github/callback`,
    scope: "read:user",
    state,
    allow_signup: "true",
  });
  return c.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
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
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/github/callback`,
      state: remoteState,
    }),
  });
  if (!tokenRes.ok) {
    throw new HTTPException(400, { message: "Failed to get token" });
  }
  const tokenJson = await tokenRes.json<{ access_token: string }>();
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      "User-Agent": "locapos-server",
    },
  });
  if (!userRes.ok) {
    throw new HTTPException(400, { message: "Failed to get user info" });
  }
  const user = await userRes.json<{ id: number; name?: string; login?: string }>();
  await setOAuthUserSession(c, {
    provider: "github",
    id: String(user.id),
    name: user.name || user.login || "",
  });
  return c.redirect("/oauth/redirect");
});

export { app as githubAuth };
