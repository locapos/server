import { cors } from "hono/cors";
import { Connection } from "../durable-objects/connection";
import { PUBLIC_MAP_KEY } from "../durable-objects/storage";
import { createHono } from "../lib/factory";

const app = createHono();

app.use("/api/*", cors({ origin: "*" }));

app.get("/:hash?", (c) => {
  const hash = c.req.param("hash") || PUBLIC_MAP_KEY;
  return Connection.stub(c.env, hash).fetch(c.req.raw);
});

export { app as ws };
