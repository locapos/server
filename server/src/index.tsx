import { Hono } from "hono";
import { api } from "./api";
import { auth } from "./auth";
import { oauth } from "./oauth";
import { Index } from "./views/Index";
import { ws } from "./ws";

export { Connection } from "./durable-objects/connection";
export { Storage } from "./durable-objects/storage";

const app = new Hono<{ Bindings: Env }>();

// API Route
app.route("/api", api);
app.route("/oauth", oauth);
app.route("/auth", auth);
app.route("/ws", ws);

// SPA Route
app.get("/", (c) => c.html(<Index mapsApiKey={c.env.GOOGLE_MAPS_API_KEY} />));
app.get("/:hash{([a-zA-Z0-9_-]{38}|[a-zA-Z0-9_-]{43})}", (c) =>
  c.html(<Index mapsApiKey={c.env.GOOGLE_MAPS_API_KEY} />)
);

export default app;
