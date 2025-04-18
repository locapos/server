export type UserId = `${string}.${string}`;
export type PrimaryKey = `locations#${string}#${UserId}`;
export type SecondaryKey = `locations#${UserId}#${string}`;

export type Location = {
  provider: string;
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  heading?: number;
  posMode: string;
};

export type Expiration = {
  provider: string;
  id: string;
  mapKey: string;
  ttl: number;
};

type LocationStorageType = Location & {
  mapKey: string;
  ttl: number;
};

const userId = (provider: string, id: string): UserId => `${provider}.${id}`;

const LocationLifeTime = 5 * 60 * 1000; // 5 minutes

const Keys = {
  primaryKey: (mapKey: string, provider: string, id: string): PrimaryKey => `locations#${mapKey}#${userId(provider, id)}`,
  secondaryKey: (provider: string, id: string, mapKey: string): SecondaryKey => `locations#${userId(provider, id)}#${mapKey}`,
  expirationKey: (ttl: number) => `exp#${ttl}`,
} as const;

const Prefixes = {
  primaryKey: (mapKey: string) => `locations#${mapKey}#`,
  secondaryKey: (provider: string, id: string) => `locations#${userId(provider, id)}#`,
  expirations: () => `exp#`,
} as const;

export class LocationRepository {
  constructor(private db: DurableObjectStorage) { }

  async put(mapKey: string, value: Location) {
    const ttl = Date.now() + LocationLifeTime;
    const storageValue = { ...value, mapKey, ttl };
    const existing = await this.db.get<LocationStorageType>(Keys.primaryKey(mapKey, value.provider, value.id));
    await this.db.put<LocationStorageType>(Keys.primaryKey(mapKey, value.provider, value.id), storageValue);
    await this.db.put<LocationStorageType>(Keys.secondaryKey(value.provider, value.id, mapKey), storageValue);
    await this.db.put<Expiration>(`exp#${ttl}`, { provider: value.provider, id: value.id, mapKey, ttl });
    if (existing) {
      this.db.delete(Keys.expirationKey(existing.ttl));
    }

    return Keys.primaryKey(mapKey, value.provider, value.id);
  }

  async get(mapKey: string, provider: string, id: string) {
    return await this.db.get<Location>(Keys.primaryKey(mapKey, provider, id));
  }

  async getNextExpiration() {
    const expirations = await this.db.list<Expiration>({ prefix: Prefixes.expirations(), limit: 1 });
    if (expirations.size === 0) return null;
    return expirations.values().toArray()[0].ttl;
  }

  async delete(mapKey: string, provider: string, id: string) {
    const key = Keys.primaryKey(mapKey, provider, id);
    const value = await this.db.get<LocationStorageType>(key);
    if (!value) return null;
    this.db.delete(key);
    this.db.delete(Keys.secondaryKey(provider, id, mapKey));
    this.db.delete(Keys.expirationKey(value.ttl));

    return key;
  }

  async deleteAll(provider: string, id: string) {
    const key = Prefixes.secondaryKey(provider, id);
    const removed: Array<PrimaryKey> = [];
    while (true) {
      const locations = await this.db.list<LocationStorageType>({ prefix: key });
      if (locations.size === 0) break;
      for (const [_, value] of locations) {
        await this.db.delete(Keys.primaryKey(value.mapKey, provider, id));
        await this.db.delete(Keys.secondaryKey(provider, id, value.mapKey));
        await this.db.delete(Keys.expirationKey(value.ttl));
        removed.push(Keys.primaryKey(value.mapKey, provider, id));
      }
    }

    return removed;
  }

  listByMapKey(mapKey: string) {
    return this.db.list<Location>({ prefix: Prefixes.primaryKey(mapKey) });
  }

  listByUserId(provider: string, id: string) {
    return this.db.list<Location>({ prefix: Prefixes.secondaryKey(provider, id) });
  }

  async listExpirations() {
    const now = Date.now();
    const expirations = await this.db.list<Expiration>({ prefix: Prefixes.expirations() });
    return [...expirations.entries()].filter(([_, value]) => value.ttl < now).map(([_, value]) => value);
  }
}