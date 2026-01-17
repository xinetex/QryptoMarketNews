import { createClient } from 'redis';

// Simple in-memory cache fallback
const globalCache = new Map<string, { value: any; expiry: number }>();

class CacheService {
    private redis: any;
    private useRedis: boolean = false;

    constructor() {
        if (process.env.REDIS_URL) {
            this.redis = createClient({
                url: process.env.REDIS_URL
            });
            this.redis.on('error', (err: any) => console.error('Redis Client Error', err));
            this.redis.connect().catch(console.error);
            this.useRedis = true;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.useRedis && this.redis?.isOpen) {
            try {
                const val = await this.redis.get(key);
                return val ? JSON.parse(val) : null;
            } catch (e) {
                console.error("Redis get failed", e);
                return this.getFromMemory(key);
            }
        }
        return this.getFromMemory(key);
    }

    async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
        if (this.useRedis && this.redis?.isOpen) {
            try {
                await this.redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
                return;
            } catch (e) {
                console.error("Redis set failed", e);
            }
        }
        this.setInMemory(key, value, ttlSeconds);
    }

    private getFromMemory<T>(key: string): T | null {
        const item = globalCache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            globalCache.delete(key);
            return null;
        }
        return item.value as T;
    }

    private setInMemory(key: string, value: any, ttlSeconds: number) {
        globalCache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000)
        });

        // Simple Cleanup if too big
        if (globalCache.size > 1000) {
            const firstKey = globalCache.keys().next().value;
            if (firstKey) globalCache.delete(firstKey); // safe deletion check
        }
    }
}

export const cache = new CacheService();
