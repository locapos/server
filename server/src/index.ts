import { Hono } from "hono";
import { api } from "./api";
import { oauth } from "./oauth";
import { auth } from "./auth";
import { ws } from "./ws";
import { AssetsRepository } from "./repositories/AssetsRepository";
import { newResponse } from "./util/response";

export { Storage } from "./durable-objects/storage";
export { Connection } from "./durable-objects/connection";

const app = new Hono<{ Bindings: Env }>();

app.route("/api", api);
app.route("/oauth", oauth);
app.route("/auth", auth);
app.route("/ws", ws);

// SPA Route
app.get("/:hash{([a-zA-Z0-9_-]{38}|[a-zA-Z0-9_-]{43})}", async (c) => {
  return newResponse(c, await new AssetsRepository(c).index());
});

export default app;
