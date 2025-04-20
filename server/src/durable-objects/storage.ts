
import { DurableObject } from "cloudflare:workers";
import { hash, uniqueId } from "../lib/hashgen";
import { Location, LocationRepository, PrimaryKey } from "../repositories/LocationRepository";
import { Connection } from "./connection";
import geo from "../lib/geo";

export { Location } from "../repositories/LocationRepository";

export class Storage extends DurableObject<Env> {
  static readonly DEFAULT = "default";
  static stub(env: Env) {
    const id = env.STORAGE_DO.idFromName(Storage.DEFAULT);
    return env.STORAGE_DO.get(id);
  }

  private locationRepository: LocationRepository;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    const locationRepository = new LocationRepository(ctx.storage);
    this.locationRepository = new LocationRepository(ctx.storage);

    ctx.blockConcurrencyWhile(async () => {
      // すでにExpireしているデータを削除する
      const expirations = await locationRepository.listExpirations();
      for (const expired of expirations) {
        const { provider, id, mapKey } = expired;
        await locationRepository.delete(mapKey, provider, id);
      }

      // 間近のExpireをスケジュールする
      const next = await locationRepository.getNextExpiration();
      if (next == null) return;
      if (next <= Date.now()) {
        setImmediate(() => this.alarm());
      } else {
        ctx.storage.setAlarm(next);
      }
    });
  }

  async storeLocation(obj: Location, group: string, isPrivate: boolean) {
    const primary = isPrivate ? uniqueId(this.env, obj) : '0';
    await this.updateAndPublish(primary, obj);
    group && await this.updateAndPublish(group, obj);
  }

  showLocations(group: string) {
    const key = group || "0";
    return this.locationRepository.listByMapKey(key);
  }

  async deleteLocation(provider: string, id: string, group: string) {
    const key = group || "0";
    if (key === "*") {
      await this.deleteAllAndPublish(provider, id);
    } else {
      await this.deleteAndPublish(provider, id, key);
    }
  }

  async alarm(_alarmInfo?: AlarmInvocationInfo) {
    const expirations = await this.locationRepository.listExpirations();
    for (const expired of expirations) {
      const { provider, id, mapKey } = expired;
      await this.deleteAndPublish(provider, id, mapKey);
    }
    await this.schedule();
  }

  private async updateAndPublish(group: string, obj: Location) {
    const withHeading = await this.ensureHeading(group, obj);
    const updated = await this.locationRepository.put(group, withHeading);
    await this.publish("update", updated, withHeading);
    await this.schedule();
  }

  private async deleteAndPublish(provider: string, id: string, group: string) {
    const removed = await this.locationRepository.delete(group, provider, id);
    if (!removed) return;

    await this.publish("delete", removed);
    await this.schedule();
  }

  private async deleteAllAndPublish(provider: string, id: string) {
    const removed = await this.locationRepository.deleteAll(provider, id);
    for (const key of removed) {
      await this.publish("delete", key);
    }
  }

  private async ensureHeading(group: string, next: Location) {
    const current = await this.locationRepository.get(group, next.provider, next.id);
    if (current == null) return next;
    if (next.heading != null) return next;
    return {
      ...next,
      heading: geo.heading(current, next)
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
    const [_, key, userId] = dataKey.split("#");
    const stub = Connection.stub(this.env, key);
    switch (event) {
      case "update":
        location && await stub.onUpdate(location);
        break;
      case "delete":
        await stub.onDelete(userId);
        break;
      default:
        throw new Error(`Unknown event type: ${event}`);
    }
  }
}