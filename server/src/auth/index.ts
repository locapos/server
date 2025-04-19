import { createHono } from "../lib/factory";
import { nullAuth } from "./null";

const app = createHono();
app.route("/null", nullAuth);

export { app as auth };
