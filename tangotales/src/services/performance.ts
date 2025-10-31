interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
}

class PerformanceService {
  private static instance: PerformanceService;
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig = {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
  };

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Cache management
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const expiry = Date.now() + (ttl || this.config.defaultTTL);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Performance monitoring
  async measurePerformance<T>(
    operation: () => Promise<T>,
    label: string
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      console.log(`Performance [${label}]: ${duration.toFixed(2)}ms`);
      return { result, duration };
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`Performance [${label}] failed: ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  // Debounced function creator
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttled function creator
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Lazy loading utilities
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });
  }

  // Memory optimization
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map((url) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  }

  // Resource cleanup
  cleanup(): void {
    this.cache.clear();
    // Add any other cleanup logic here
  }

  // Cache statistics
  getCacheStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        expired++;
      } else {
        active++;
      }
    });

    return {
      size: this.cache.size,
      active,
      expired,
      hitRate: this.calculateHitRate(),
    };
  }

  private calculateHitRate(): number {
    // This would need to be tracked more thoroughly in a real implementation
    // For now, return a placeholder
    return 0.75; // 75% hit rate placeholder
  }

  // Batch operations for efficiency
  async batchOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    batchSize: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => operation(item))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  // Network optimization
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
  let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
          if (attempt === maxRetries) {
            // Ensure we throw an Error object
            if (lastError instanceof Error) {
              throw lastError;
            }
            throw new Error(String(lastError));
          }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, attempt))
        );
      }
    }
    
    // Final throw - ensure an Error object is thrown
    if (lastError instanceof Error) {
      throw lastError;
    }
    throw new Error(String(lastError));
  }
}

export default PerformanceService;