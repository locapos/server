import { createHono } from "../lib/factory";
import { enforce } from "../middleware/enforce";

const app = createHono();

app.get("/me", enforce, async (c) => {
});

export { app as users };