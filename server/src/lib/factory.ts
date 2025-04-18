import { Hono } from "hono";

export const createHono = () => {
  return new Hono<{ Bindings: Env }>();
};
