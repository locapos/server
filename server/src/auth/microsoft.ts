import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import { getOAuthProviderStateSession, setOAuthUserSession, setOAuthProviderStateSession } from "../util/oauth-session";
import { HTTPException } from "hono/http-exception";

const MS_AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setOAuthProviderStateSession(c, { state });
  const params = new URLSearchParams({
    client_id: c.env.MSA_CLIENT_ID,
    response_type: "code",
    redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/microsoft/callback`,
    response_mode: "query",
    scope: "openid profile",
    state,
  });
  return c.redirect(`${MS_AUTHORITY}/authorize?${params.toString()}`);
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
  const tokenRes = await fetch(`${MS_AUTHORITY}/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: c.env.MSA_CLIENT_ID,
      client_secret: c.env.MSA_CLIENT_SECRET,
      code,
      redirect_uri: `${c.env.REDIRECT_URI_BASE}/auth/microsoft/callback`,
      grant_type: "authorization_code",
      scope: "openid email profile User.Read",
    }),
  });
  if (!tokenRes.ok) {
    throw new HTTPException(400, { message: "Failed to get token" });
  }
  const tokenJson = await tokenRes.json<{ access_token: string }>();
  const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!userRes.ok) {
    throw new HTTPException(400, { message: "Failed to get user info" });
  }
  const user = await userRes.json<{
    id: string;
    displayName?: string;
    userPrincipalName?: string;
  }>();
  await setOAuthUserSession(c, {
    provider: "microsoft",
    id: user.id,
    name: user.displayName || user.userPrincipalName || "",
  });
  return c.redirect("/oauth/redirect");
});

export { app as microsoftAuth };
