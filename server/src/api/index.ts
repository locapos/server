import { Hono } from "hono";
import { locations } from "./locations";
import { groups } from "./groups";
import { users } from "./users";
import { terms } from "./terms";
import { cors } from "hono/cors";
import { decompress } from "../middleware/decompress";

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("/*", cors({ origin: "*" }));
app.use("/*", decompress);

// Routes
app.route("/locations", locations);
app.route("/groups", groups);
app.route("/users", users);
app.route("/terms", terms);

export { app as api };
