import { Hono } from "hono";
import { locations } from "./locations";
import { groups } from "./groups";
import { users } from "./users";
import { terms } from "./terms";

const app = new Hono<{ Bindings: Env }>();

app.route("/locations", locations);
app.route("/groups", groups);
app.route("/users", users);
app.route("/terms", terms);

export { app as api };
