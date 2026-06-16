import Redis from 'ioredis';

class InMemoryRedis {
  private cache = new Map<string, { value: string; expiry: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiry: number | null = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    }
    this.cache.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let count = 0;
    for (const k of keys) {
      if (this.cache.delete(k)) {
        count++;
      }
    }
    return count;
  }

  async incr(key: string): Promise<number> {
    const val = await this.get(key);
    const num = val ? parseInt(val, 10) : 0;
    const nextVal = num + 1;
    await this.set(key, nextVal.toString());
    return nextVal;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const val = await this.get(key);
    if (val !== null) {
      this.cache.set(key, { value: val, expiry: Date.now() + seconds * 1000 });
      return 1;
    }
    return 0;
  }
}

const globalForRedis = global as unknown as { redis: Redis | InMemoryRedis };

const redisUrl = process.env.REDIS_URL;

const createRedisClient = (): Redis | InMemoryRedis => {
  if (redisUrl) {
    try {
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
      // Connect lazily and handle errors
      client.on('error', (err) => {
        console.warn('Redis Connection Error:', err.message);
      });
      return client;
    } 
    catch (error: any) {
      console.warn('Failed to initialize Redis with URL, falling back to In-Memory:', error?.message);
      return new InMemoryRedis();
    }
  } 
  else {
    console.warn('REDIS_URL not set. Using In-Memory cache fallback.');
    return new InMemoryRedis();
  }
};

export const redis = globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;


// rate_limit:${userId} 60
// user_cache:${userId} 24 hours
// community_feed 600
// dashboard:${userId} 600
