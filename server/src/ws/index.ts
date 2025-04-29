import { cors } from "hono/cors";
import { Connection } from "../durable-objects/connection";
import { createHono } from "../lib/factory";

const app = createHono();

app.use("/api/*", cors({ origin: "*" }));

app.get("/:hash?", (c) => {
  const hash = c.req.param("hash") || "0";
  return Connection.stub(c.env, hash).fetch(c.req.raw);
});

export { app as ws };