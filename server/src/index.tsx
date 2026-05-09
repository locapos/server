import { Hono } from "hono";
import { api } from "./api";
import { oauth } from "./oauth";
import { auth } from "./auth";
import { ws } from "./ws";
import { Index } from "./views/Index";

export { Storage } from "./durable-objects/storage";
export { Connection } from "./durable-objects/connection";

const app = new Hono<{ Bindings: Env }>();

// API Route
app.route("/api", api);
app.route("/oauth", oauth);
app.route("/auth", auth);
app.route("/ws", ws);

// SPA Route
app.get("/", (c) => c.html(<Index mapsApiKey={c.env.GOOGLE_MAPS_API_KEY} />));
app.get("/:hash{([a-zA-Z0-9_-]{38}|[a-zA-Z0-9_-]{43})}", (c) => c.html(<Index mapsApiKey={c.env.GOOGLE_MAPS_API_KEY} />));

export default app;
