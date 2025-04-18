import { HTTPException } from "hono/http-exception";
import { Storage } from "../durable-objects/storage";
import { createHono } from "../lib/factory";
import { enforce } from "../middleware/enforce";
import { drizzle } from "drizzle-orm/d1";
import { accessTokensTable } from "../../drizzle/schema";
import { uniqueId } from "../lib/hashgen";
import { eq } from "drizzle-orm";

const app = createHono();

app.get("/show", enforce, async (c) => {
  const key = c.req.query("key") || "0";
  const storage = c.env.STORAGE_DO.idFromName(Storage.DEFAULT);
  const stub = c.env.STORAGE_DO.get(storage);
  return c.json(stub.showLocations(key));
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
  let ok = false;
  if (body.screen_name) {
    user.username = body.screen_name;
    ok = true;
  }
  if (body.screen_name === "" && user.default_username) {
    user.username = user.default_username;
    ok = true;
  }
  if (!ok) throw new HTTPException(403);
  // store user
  const db = drizzle(c.env.SDB);
  await db.update(accessTokensTable)
    .set({ username: user.username })
    .where(eq(accessTokensTable.hash, uniqueId(c.env, user)));
  c.text("ok");
});

export { app as users };