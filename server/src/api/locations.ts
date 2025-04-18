import { createHono } from "../lib/factory";
import { Location, Storage } from "../durable-objects/storage";
type UpdateRequestBody = {
  latitude: string;
  longitude: string;
  heading: string;
  posMode: string;
  private: string;
  key: string;
};

const app = createHono();

app.post("/update", async (c) => {
  const body = await c.req.parseBody<UpdateRequestBody>();
  const obj: Location = {
    provider: "stub_provider",
    id: "stub_user",
    name: "stub_name",
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    heading: parseFloat(body.heading) % 360,
    posMode: body.posMode,
  };
  const group = body.key || '';
  const isPrivate = body.private === "true";
  // check values
  if (isNaN(obj.latitude)) return c.status(400);
  if (isNaN(obj.longitude)) return c.status(400);
  if (obj.heading != null && isNaN(obj.heading)) {
    obj.heading = undefined;
  }
  // normalize heading 0 to 360
  if (obj.heading !== undefined) {
    obj.heading = obj.heading < 0 ? obj.heading + 360 : obj.heading;
  }
  // group key must be 43 characters
  const groups = group.split(",");
  for (const g of groups) {
    if (g.length !== 0 && g.length !== 43) return c.status(403);
  }
  // store location
  const storage = c.env.STORAGE_DO.idFromName(Storage.DEFAULT);
  const stub = c.env.STORAGE_DO.get(storage);
  stub.storeLocation(obj, group, isPrivate);
  return c.text("ok");
});

app.post("/delete", async (c) => {
  const body = await c.req.parseBody<{ key: string }>();
  const group = body.key || '0';
  // delete location
  const storage = c.env.STORAGE_DO.idFromName(Storage.DEFAULT);
  const stub = c.env.STORAGE_DO.get(storage);
  stub.deleteLocation("stub_provider", "stub_user", group);
  return c.text("ok");
});

export { app as locations };