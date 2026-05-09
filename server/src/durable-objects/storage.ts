import { DurableObject } from "cloudflare:workers";
import { Location, LocationRepository, PrimaryKey } from "../repositories/LocationRepository";
import { Connection } from "./connection";
import geo from "../lib/geo";

export { Location } from "../repositories/LocationRepository";
export const PUBLIC_MAP_KEY = "0";

export class Storage extends DurableObject<Env> {
  static readonly DEFAULT = "default";
  static stub(env: Env) {
    const id = env.STORAGE_DO.idFromName(Storage.DEFAULT);
    return env.STORAGE_DO.get(id);
  }

  private locationRepository: LocationRepository;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.locationRepository = new LocationRepository(ctx.storage);

    ctx.blockConcurrencyWhile(async () => {
      // すでにExpireしているデータを削除する
      const expirations = await this.locationRepository.listExpirations();
      for (const expired of expirations) {
        await this.locationRepository.delete(expired.mapKey, expired.id);
      }

      // 間近のExpireをスケジュールする
      const next = await this.locationRepository.getNextExpiration();
      if (next == null) return;
      if (next <= Date.now()) {
        setImmediate(() => this.alarm());
      } else {
        ctx.storage.setAlarm(next);
      }
    });
  }

  async storeLocations(obj: Location, mapKeys: string[]) {
    await Promise.all(mapKeys.map((k) => this.updateAndPublish(k, obj)));
  }

  async showLocations(group: string) {
    const key = group || PUBLIC_MAP_KEY;
    return await this.locationRepository.listByMapKey(key);
  }

  async deleteLocation(id: string, group: string) {
    const key = group || PUBLIC_MAP_KEY;
    if (key === "*") {
      await this.deleteAllAndPublish(id);
    } else {
      await this.deleteAndPublish(id, key);
    }
  }

  async alarm() {
    const expirations = await this.locationRepository.listExpirations();
    for (const expired of expirations) {
      await this.deleteAndPublish(expired.id, expired.mapKey);
    }
    await this.schedule();
  }

  private async updateAndPublish(group: string, obj: Location) {
    const withHeading = await this.ensureHeading(group, obj);
    const updated = await this.locationRepository.put(group, withHeading);
    await this.publish("update", updated, withHeading);
    await this.schedule();
  }

  private async deleteAndPublish(id: string, group: string) {
    const removed = await this.locationRepository.delete(group, id);
    if (!removed) return;

    await this.publish("delete", removed);
    await this.schedule();
  }

  private async deleteAllAndPublish(id: string) {
    const removed = await this.locationRepository.deleteAll(id);
    for (const key of removed) {
      await this.publish("delete", key);
    }
  }

  private async ensureHeading(group: string, next: Location) {
    const current = await this.locationRepository.get(group, next.id);
    if (current == null) return next;
    if (next.heading != null) return next;
    return {
      ...next,
      heading: geo.heading(current, next),
    };
  }

  private async schedule() {
    const next = await this.locationRepository.getNextExpiration();
    if (next == null) return;
    if (next <= Date.now()) {
      setImmediate(() => this.alarm());
    } else {
      this.ctx.storage.setAlarm(next);
    }
  }

  private async publish(event: "update" | "delete", dataKey: PrimaryKey, location?: Location) {
    const [, key, userId] = dataKey.split("#");
    const stub = Connection.stub(this.env, key);
    console.log({ action: "publish", event, dataKey, location, key, userId });
    switch (event) {
      case "update":
        if (!location) return;
        await stub.onUpdate(location);
        break;
      case "delete":
        await stub.onDelete(userId);
        break;
      default:
        throw new Error(`Unknown event type: ${event}`);
    }
  }
}
