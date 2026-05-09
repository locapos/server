export type PrimaryKey = `locations#${string}#${string}`;
export type SecondaryKey = `locations#${string}#${string}`;

export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  heading?: number;
  posMode: string;
};

type Expiration = {
  id: string;
  mapKey: string;
  ttl: number;
};

type LocationStorageType = Location & {
  mapKey: string;
  ttl: number;
};

const Keys = {
  primaryKey: (mapKey: string, id: string): PrimaryKey => `locations#${mapKey}#${id}`,
  secondaryKey: (id: string, mapKey: string): SecondaryKey => `locations#${id}#${mapKey}`,
  expirationKey: (ttl: number) => `exp#${ttl}`,
} as const;

const Prefixes = {
  primaryKey: (mapKey: string) => `locations#${mapKey}#`,
  secondaryKey: (id: string) => `locations#${id}#`,
  expirations: () => `exp#`,
} as const;

const LocationLifeTime = 5 * 60 * 1000; // 5 minutes

export class LocationRepository {
  constructor(private db: DurableObjectStorage) {}

  async put(mapKey: string, value: Location) {
    const ttl = Date.now() + LocationLifeTime;
    const storageValue = { ...value, mapKey, ttl };
    const existing = await this.db.get<LocationStorageType>(Keys.primaryKey(mapKey, value.id));
    await this.db.put<LocationStorageType>(Keys.primaryKey(mapKey, value.id), storageValue);
    await this.db.put<LocationStorageType>(Keys.secondaryKey(value.id, mapKey), storageValue);
    await this.db.put<Expiration>(`exp#${ttl}`, { id: value.id, mapKey, ttl });
    if (existing) {
      this.db.delete(Keys.expirationKey(existing.ttl));
    }
    return Keys.primaryKey(mapKey, value.id);
  }

  async get(mapKey: string, id: string) {
    return await this.db.get<Location>(Keys.primaryKey(mapKey, id));
  }

  async getNextExpiration() {
    const expirations = await this.db.list<Expiration>({
      prefix: Prefixes.expirations(),
      limit: 1,
    });
    if (expirations.size === 0) return null;
    return expirations.values().toArray()[0].ttl;
  }

  async delete(mapKey: string, id: string) {
    const key = Keys.primaryKey(mapKey, id);
    const value = await this.db.get<LocationStorageType>(key);
    if (!value) return null;
    this.db.delete(key);
    this.db.delete(Keys.secondaryKey(id, mapKey));
    this.db.delete(Keys.expirationKey(value.ttl));
    return key;
  }

  async deleteAll(id: string) {
    const prefix = Prefixes.secondaryKey(id);
    const removed: Array<PrimaryKey> = [];
    while (true) {
      const locations = await this.db.list<LocationStorageType>({ prefix });
      if (locations.size === 0) break;
      for (const [, value] of locations) {
        await this.db.delete(Keys.primaryKey(value.mapKey, id));
        await this.db.delete(Keys.secondaryKey(id, value.mapKey));
        await this.db.delete(Keys.expirationKey(value.ttl));
        removed.push(Keys.primaryKey(value.mapKey, id));
      }
    }
    return removed;
  }

  async listByMapKey(mapKey: string) {
    return (await this.db.list<Location>({ prefix: Prefixes.primaryKey(mapKey) }))
      .values()
      .toArray();
  }

  async listExpirations() {
    const now = Date.now();
    const expirations = await this.db.list<Expiration>({ prefix: Prefixes.expirations() });
    return [...expirations.entries()]
      .filter(([, value]) => value.ttl <= now)
      .map(([, value]) => value);
  }
}
