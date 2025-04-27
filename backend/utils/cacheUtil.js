const NodeCache = require("node-cache");
const config = require("../config/config");
const LoggingUtil = require("./loggingUtil");

class CacheUtil {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.checkPeriod,
    });

    // Setup cache events
    this.cache.on("expired", (key, value) => {
      LoggingUtil.debug("Cache item expired", { key });
    });

    this.cache.on("flush", () => {
      LoggingUtil.info("Cache flushed");
    });
  }

  // Get item from cache
  get(key) {
    const value = this.cache.get(key);
    LoggingUtil.debug("Cache get", { key, hit: !!value });
    return value;
  }

  // Set item in cache
  set(key, value, ttl = config.cache.ttl) {
    const success = this.cache.set(key, value, ttl);
    LoggingUtil.debug("Cache set", { key, success });
    return success;
  }

  // Delete item from cache
  delete(key) {
    const deleted = this.cache.del(key);
    LoggingUtil.debug("Cache delete", { key, deleted });
    return deleted;
  }

  // Clear entire cache
  clear() {
    this.cache.flushAll();
    LoggingUtil.info("Cache cleared");
  }

  // Get multiple items
  getMultiple(keys) {
    const values = this.cache.mget(keys);
    LoggingUtil.debug("Cache get multiple", {
      keys,
      hits: Object.keys(values).length,
    });
    return values;
  }

  // Set multiple items
  setMultiple(keyValuePairs, ttl = config.cache.ttl) {
    const success = this.cache.mset(
      Object.entries(keyValuePairs).map(([key, value]) => ({
        key,
        val: value,
        ttl,
      }))
    );
    LoggingUtil.debug("Cache set multiple", {
      keys: Object.keys(keyValuePairs),
      success,
    });
    return success;
  }

  // Delete multiple items
  deleteMultiple(keys) {
    const deleted = this.cache.del(keys);
    LoggingUtil.debug("Cache delete multiple", { keys, deleted });
    return deleted;
  }

  // Get cache statistics
  getStats() {
    return this.cache.getStats();
  }

  // Check if key exists
  has(key) {
    return this.cache.has(key);
  }

  // Get all keys
  keys() {
    return this.cache.keys();
  }

  // Get cache size
  size() {
    return this.cache.size();
  }

  // Wrapper function to cache function results
  async cacheWrapper(key, fn, ttl = config.cache.ttl) {
    const cachedValue = this.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const value = await fn();
    this.set(key, value, ttl);
    return value;
  }

  // Generate cache key based on parameters
  static generateKey(prefix, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  // Cache middleware for Express routes
  routeCache(duration = config.cache.ttl) {
    return (req, res, next) => {
      if (req.method !== "GET") {
        return next();
      }

      const key = CacheUtil.generateKey(req.originalUrl, {
        query: req.query,
        params: req.params,
        user: req.user?.userId,
      });

      const cachedResponse = this.get(key);
      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Store original json function
      const originalJson = res.json;

      // Override json function
      res.json = (body) => {
        // Restore original json function
        res.json = originalJson;

        // Cache the response
        this.set(key, body, duration);

        // Send the response
        return res.json(body);
      };

      next();
    };
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern) {
    const keys = this.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    const deleted = this.deleteMultiple(matchingKeys);
    LoggingUtil.info("Cache pattern invalidation", {
      pattern,
      matchingKeys,
      deleted,
    });
    return deleted;
  }
}

// Create singleton instance
const cacheInstance = new CacheUtil();

module.exports = cacheInstance;
