import { Context } from "hono";

export function newResponse(c: Context, init: Response) {
  return c.newResponse(init.body, init);
}
