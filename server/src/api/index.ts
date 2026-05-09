import { Hono } from "hono";
import { cors } from "hono/cors";
import { decompress } from "../middleware/decompress";
import { groups } from "./groups";
import { locations } from "./locations";
import { terms } from "./terms";
import { users } from "./users";

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
