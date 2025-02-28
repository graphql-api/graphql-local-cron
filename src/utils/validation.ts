import * as cronParser from 'cron-parser';

export function validateCronExpression(expression: string): boolean {
  try {
    // Attempt to parse the cron expression
    cronParser.parseExpression(expression);
    return true;
  } catch (error) {
    return false;
  }
}

export function validatePayloadSize(payload: any, maxSizeInBytes: number = 5 * 1024 * 1024): boolean {
  try {
    const stringified = JSON.stringify(payload);
    return new Blob([stringified]).size <= maxSizeInBytes;
  } catch (error) {
    return false;
  }
}

export function validateRequiredFields(obj: any, requiredFields: string[]): string[] {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null) {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}

export interface RateLimiter {
  tryAcquire(): boolean;
  reset(): void;
}

export class TokenBucketRateLimiter implements RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms

  constructor(maxTokensPerMinute: number) {
    this.maxTokens = maxTokensPerMinute;
    this.tokens = maxTokensPerMinute;
    this.lastRefill = Date.now();
    this.refillRate = maxTokensPerMinute / (60 * 1000); // Convert to tokens per ms
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  public tryAcquire(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }

  public reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}