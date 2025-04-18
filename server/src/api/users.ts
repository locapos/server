import { createHono } from "../lib/factory";

const app = createHono();

export { app as users };