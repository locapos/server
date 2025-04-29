import { createHono } from "../lib/factory";
import { hash } from "../lib/hashgen";
import { getAuthState, setAuthUser, setAuthState } from "../util/auth-session";
import { HTTPException } from "hono/http-exception";

// null authorizer

const app = createHono();

app.get("/", async (c) => {
  const state = hash();
  await setAuthState(c, state);
  return c.redirect(`/auth/null/callback?state=${state}`);
});

app.get("/callback", async (c) => {
  const remoteState = c.req.query("state");
  const state = await getAuthState(c);
  if (!state || state.state !== remoteState) {
    throw new HTTPException(400, { message: "Invalid state" });
  }
  await setAuthUser(c, {
    provider: "null",
    id: "null",
    name: "null",
  });
  return c.redirect("/oauth/redirect");
});

export { app as nullAuth };
