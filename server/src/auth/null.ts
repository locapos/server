import { HTTPException } from "hono/http-exception";
import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import {
  getOAuthProviderStateSession,
  setOAuthProviderStateSession,
  setOAuthUserSession,
} from "../util/oauth-session";

// null authorizer

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setOAuthProviderStateSession(c, { state });
  return c.redirect(`/auth/null/callback?state=${state}`);
});

app.get("/callback", async (c) => {
  const remoteState = c.req.query("state");
  const stateSession = await getOAuthProviderStateSession(c);
  if (!stateSession || stateSession.state !== remoteState) {
    throw new HTTPException(400, { message: "Invalid state" });
  }
  await setOAuthUserSession(c, {
    provider: "null",
    id: "null",
    name: "null",
  });
  return c.redirect("/oauth/redirect");
});

export { app as nullAuth };
