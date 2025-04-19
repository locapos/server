import { createHono } from "../lib/factory";
import { nullAuth } from "./null";
import { googleAuth } from "./google";
import { githubAuth } from "./github";
import { facebookAuth } from "./facebook";
import { microsoftAuth } from "./microsoft";
import { lineAuth } from "./line";

const app = createHono();
app.route("/null", nullAuth);
app.route("/google", googleAuth);
app.route("/github", githubAuth);
app.route("/facebook", facebookAuth);
app.route("/microsoft", microsoftAuth);
app.route("/line", lineAuth);

export { app as auth };
