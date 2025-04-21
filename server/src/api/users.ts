import { HTTPException } from "hono/http-exception";
import { Storage } from "../durable-objects/storage";
import { createHono } from "../lib/factory";
import { enforce } from "../middleware/enforce";
import { uniqueId } from "../lib/hashgen";
import { AccessTokenRepository } from "../repositories/AccessTokenRepository";

const app = createHono();

app.get("/show", enforce, async (c) => {
  const key = c.req.query("key") || "0";
  const stub = Storage.stub(c.env);
  return c.json(await stub.showLocations(key));
});

app.get("/me", enforce, async (c) => {
  const user = c.get("user");
  return c.json({
    provider: user.provider,
    id: user.id,
    name: user.username,
  });
});

app.get("/share", enforce, async (c) => {
  const key = uniqueId(c.env, c.get("user"));
  return c.json({ key });
});

app.post("/update", enforce, async (c) => {
  const body = await c.req.parseBody<{ screen_name?: string }>();
  const user = c.get("user");
  let newUsername = "";

  if (body.screen_name) {
    newUsername = body.screen_name;
  } else if (body.screen_name === "" && user.default_username) {
    newUsername = user.default_username;
  } else {
    throw new HTTPException(403);
  }

  const tokenRepository = new AccessTokenRepository(c.env.SDB);
  await tokenRepository.updateUsername(user.hash, newUsername);

  c.text("ok");
});

export { app as users };