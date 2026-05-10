import { createHono } from "../lib/factory";
import { appleAuth } from "./apple";
import { githubAuth } from "./github";
import { googleAuth } from "./google";
import { lineAuth } from "./line";
import { microsoftAuth } from "./microsoft";
import { xAuth } from "./x";

const app = createHono();
//app.route("/null", nullAuth);
app.route("/google", googleAuth);
app.route("/github", githubAuth);
//app.route("/facebook", facebookAuth);
app.route("/microsoft", microsoftAuth);
app.route("/line", lineAuth);
app.route("/apple", appleAuth);
app.route("/x", xAuth);

export { app as auth };
