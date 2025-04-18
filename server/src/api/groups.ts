import { hash } from "../lib/hashgen";
import { createHono } from "../lib/factory";

const app = createHono();

app.get("/join", async (c) => {
  const key = c.req.query("key");
  if (!key) return c.text("key is required", 400);
  return c.redirect(`locapos-api:///join?key=${encodeURIComponent(key)}`);
});

app.get("/new", (c) => {
  return c.json({ key: hash() });
});

export { app as groups };