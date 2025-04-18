import { hash } from "../lib/hashgen";
import { createHono } from "../lib/factory";
import { HTTPException } from "hono/http-exception";

const app = createHono();

app.get("/join", async (c) => {
  const key = c.req.query("key");
  if (!key) throw new HTTPException(400, { message: "key is required" });
  return c.redirect(`locapos-api:///join?key=${encodeURIComponent(key)}`);
});

app.get("/new", (c) => {
  return c.json({ key: hash() });
});

export { app as groups };