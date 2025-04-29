import { createHono } from "../lib/factory";
import { Location, Storage } from "../durable-objects/storage";
import { HTTPException } from "hono/http-exception";
import { enforce } from "../middleware/enforce";
type UpdateRequestBody = {
  latitude: string;
  longitude: string;
  heading: string;
  posMode: string;
  private: string;
  key: string;
};

const app = createHono();

app.post("/update", enforce, async (c) => {
  const body = await c.req.parseBody<UpdateRequestBody>();
  const user = c.get("user");
  const obj: Location = {
    provider: user.provider,
    id: user.id,
    name: user.username,
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    heading: parseFloat(body.heading) % 360,
    posMode: body.posMode,
  };
  const group = body.key || "";
  const isPrivate = body.private === "true";
  // check values
  if (isNaN(obj.latitude)) throw new HTTPException(400, { message: "latitude is not a number" });
  if (isNaN(obj.longitude)) throw new HTTPException(400, { message: "longitude is not a number" });
  if (obj.heading != null && isNaN(obj.heading)) {
    obj.heading = undefined;
  }
  // normalize heading 0 to 360
  if (obj.heading !== undefined) {
    obj.heading = obj.heading < 0 ? obj.heading + 360 : obj.heading;
  }
  // group key must be 43 characters
  const groups = group.split(",").filter(g => g.length !== 0);
  for (const g of groups) {
    if (g.length !== 0 && g.length !== 43) {
      throw new HTTPException(403, { message: "group key must be 43 characters" });
    }
  }
  // store location
  const stub = Storage.stub(c.env);
  await stub.storeLocation(obj, groups, isPrivate);
  return c.text("ok");
});

app.post("/delete", enforce, async (c) => {
  const body = await c.req.parseBody<{ key: string }>();
  const user = c.get("user");
  const group = body.key;
  // delete location
  const stub = Storage.stub(c.env);
  await stub.deleteLocation(user.provider, user.id, group);
  return c.text("ok");
});

export { app as locations };