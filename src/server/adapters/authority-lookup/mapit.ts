import axios from 'axios';
import type { AppConfig } from '../../config.js';

export type AuthorityLookup = {
  lookup(latitude: number, longitude: number): Promise<string[] | null>;
};
export class MapItAuthorityLookup implements AuthorityLookup {
  constructor(private readonly config: AppConfig) {}
  async lookup(latitude: number, longitude: number) {
    try {
      const response = await axios.get(
        `${this.config.AUTHORITY_LOOKUP_BASE_URL}/point/4326/${longitude},${latitude}`,
        {
          params: this.config.AUTHORITY_LOOKUP_API_KEY
            ? { api_key: this.config.AUTHORITY_LOOKUP_API_KEY }
            : undefined,
          timeout: 10_000,
          validateStatus: (status) => status >= 200 && status < 300,
        },
      );
      const data = response.data;
      if (!data || typeof data !== 'object') return null;
      const values = Array.isArray(data) ? data : Object.values(data as Record<string, unknown>);
      const ids = values
        .map((value) => {
          if (typeof value === 'string' || typeof value === 'number') return String(value);
          if (value && typeof value === 'object') {
            const record = value as Record<string, unknown>;
            return typeof record.id === 'number' || typeof record.id === 'string'
              ? String(record.id)
              : typeof record.code === 'string'
                ? record.code
                : null;
          }
          return null;
        })
        .filter((id): id is string => Boolean(id));
      return ids.length ? ids : null;
    } catch {
      return null;
    }
  }
}
