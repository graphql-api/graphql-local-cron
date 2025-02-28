import { gql } from 'graphql-tag';
import { CronScheduler } from './scheduler/scheduler';
import { IndexedDBStorage } from './storage/indexeddb';
import { BroadcastService, TaskRegistry } from './services/broadcast';
import { createResolvers } from './resolvers';
import { registerServiceWorker, requestBackgroundSync } from './serviceworker';
import { 
  CronJobInput, 
  CronJob, 
  JobStatus, 
  TaskPayload, 
  CronJobConfiguration,
  TaskHandler
} from './types';
import { TokenBucketRateLimiter } from './utils/validation';

// Default config
const DEFAULT_CONFIG: CronJobConfiguration = {
  storagePrefix: 'graphql-cron',
  broadcastChannelName: 'graphql-cron-events',
  maxConcurrentJobs: 5,
  defaultMaxRetries: 3,
  jobExpirationDays: 30,
  enableNotifications: false,
  rateLimits: {
    createJob: 60, // 60 jobs per minute
    triggerJob: 30  // 30 triggers per minute
  }
};

export { JobStatus };

export class GraphQLCron {
  private scheduler: CronScheduler;
  private storageAdapter: IndexedDBStorage;
  private broadcastService: BroadcastService;
  private taskRegistry: TaskRegistry;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private worker: Worker | null = null;
  private createJobRateLimiter: TokenBucketRateLimiter;
  private triggerJobRateLimiter: TokenBucketRateLimiter;
  private config: CronJobConfiguration;

  constructor(config: Partial<CronJobConfiguration> = {}) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      rateLimits: {
        ...DEFAULT_CONFIG.rateLimits,
        ...(config.rateLimits || {})
      }
    };
    
    // Set up rate limiters
    this.createJobRateLimiter = new TokenBucketRateLimiter(this.config.rateLimits!.createJob);
    this.triggerJobRateLimiter = new TokenBucketRateLimiter(this.config.rateLimits!.triggerJob);
    
    // Initialize services
    this.taskRegistry = new TaskRegistry();
    this.broadcastService = new BroadcastService(this.config.broadcastChannelName!);
    this.storageAdapter = new IndexedDBStorage(this.config.storagePrefix);
    
    // Initialize scheduler
    this.scheduler = new CronScheduler(
      this.storageAdapter,
      this.taskRegistry,
      this.broadcastService,
      {
        maxConcurrentJobs: this.config.maxConcurrentJobs,
        defaultMaxRetries: this.config.defaultMaxRetries,
        jobExpirationDays: this.config.jobExpirationDays
      }
    );
    
    // Initialize service worker if browser supports it
    this.initServiceWorker();
    
    // Initialize web worker if browser supports it
    this.initWebWorker();
  }

  private async initServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await registerServiceWorker();
        
        if (this.serviceWorkerRegistration && 'sync' in this.serviceWorkerRegistration) {
          // Register for background sync
          await requestBackgroundSync(this.serviceWorkerRegistration);
        }
        
        // Set up notifications if enabled
        if (this.config.enableNotifications && this.serviceWorkerRegistration) {
          this.setupNotifications();
        }
      } catch (error) {
        console.warn('Service Worker initialization failed:', error);
      }
    }
  }

  private async setupNotifications(): Promise<void> {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
      }
    } catch (error) {
      console.warn('Error setting up notifications:', error);
    }
  }

  private initWebWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        // Create a worker from a blob URL
        const workerCode = `
          ${this.getWorkerCode()}
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        
        this.worker = new Worker(workerUrl);
        
        // Clean up the URL
        URL.revokeObjectURL(workerUrl);
        
        // Set up message handler
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
        this.worker.onerror = this.handleWorkerError.bind(this);
      } catch (error) {
        console.warn('Web Worker initialization failed:', error);
      }
    }
  }

  private getWorkerCode(): string {
    // Return the worker implementation
    return `
      self.onmessage = function(event) {
        const { type, data, jobId } = event.data;
        
        try {
          switch (type) {
            case 'EXECUTE_TASK':
              // Execute the provided task
              const result = executeTask(data);
              self.postMessage({
                type: 'TASK_COMPLETED',
                jobId,
                result
              });
              break;
              
            case 'VALIDATE_CRON':
              // Validate cron expression
              const isValid = validateCronExpression(data.expression);
              self.postMessage({
                type: 'CRON_VALIDATION',
                jobId,
                isValid
              });
              break;
              
            default:
              throw new Error('Unknown task type: ' + type);
          }
        } catch (error) {
          self.postMessage({
            type: 'ERROR',
            jobId,
            error: error.message || 'Unknown error'
          });
        }
      };
      
      function executeTask(data) {
        // Simple task executor
        const { taskType, payload } = data;
        
        switch (taskType) {
          case 'COMPUTATION':
            return performComputation(payload);
          default:
            throw new Error('Unknown task type: ' + taskType);
        }
      }
      
      function performComputation(payload) {
        // Example computation
        const { operation, values } = payload;
        
        switch (operation) {
          case 'SORT':
            return [...values].sort((a, b) => a - b);
          case 'FILTER':
            return values.filter(v => {
              try {
                return new Function('v', 'return ' + payload.predicate)(v);
              } catch (e) {
                return false;
              }
            });
          default:
            throw new Error('Unknown operation: ' + operation);
        }
      }
      
      function validateCronExpression(expression) {
        try {
          const parts = expression.split(' ');
          
          if (parts.length < 5 || parts.length > 6) {
            return false;
          }
          
          // Very basic validation
          return true;
        } catch (error) {
          return false;
        }
      }
    `;
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { type, jobId, result, error, isValid } = event.data;
    
    switch (type) {
      case 'TASK_COMPLETED':
        this.broadcastService.publish('WORKER_TASK_COMPLETED', { jobId, result });
        break;
      case 'TASK_FAILED':
        this.broadcastService.publish('WORKER_TASK_FAILED', { jobId, error });
        break;
      case 'CRON_VALIDATION':
        this.broadcastService.publish('CRON_VALIDATION_RESULT', { jobId, isValid, error });
        break;
      case 'ERROR':
        console.error('Worker error:', error);
        break;
    }
  }

  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error.message);
  }

  // Public API methods
  
  /**
   * Start the cron scheduler
   */
  public start(): void {
    this.scheduler.start();
  }
  
  /**
   * Stop the cron scheduler
   */
  public stop(): void {
    this.scheduler.stop();
  }
  
  /**
   * Register a task handler for a specific task type
   */
  public registerTaskHandler(type: string, handler: TaskHandler): void {
    this.taskRegistry.registerTask(type, handler);
  }
  
  /**
   * Get all jobs
   */
  public async getJobs(): Promise<CronJob[]> {
    return this.storageAdapter.getJobs();
  }
  
  /**
   * Get a job by ID
   */
  public async getJob(id: string): Promise<CronJob | null> {
    return this.storageAdapter.getJob(id);
  }
  
  /**
   * Get jobs by tag
   */
  public async getJobsByTag(tag: string): Promise<CronJob[]> {
    return this.storageAdapter.getJobsByTag(tag);
  }
  
  /**
   * Get jobs by status
   */
  public async getJobsByStatus(status: JobStatus): Promise<CronJob[]> {
    return this.storageAdapter.getJobsByStatus(status);
  }
  
  /**
   * Create a new job
   */
  public async createJob(input: CronJobInput): Promise<CronJob> {
    // Check rate limit
    if (!this.createJobRateLimiter.tryAcquire()) {
      throw new Error('Rate limit exceeded for job creation');
    }
    
    return this.scheduler.createJob(input);
  }
  
  /**
   * Update an existing job
   */
  public async updateJob(id: string, input: CronJobInput): Promise<CronJob | null> {
    return this.scheduler.updateJob(id, input);
  }
  
  /**
   * Delete a job
   */
  public async deleteJob(id: string): Promise<boolean> {
    return this.scheduler.deleteJob(id);
  }
  
  /**
   * Pause a job
   */
  public async pauseJob(id: string): Promise<CronJob | null> {
    return this.scheduler.pauseJob(id);
  }
  
  /**
   * Resume a paused job
   */
  public async resumeJob(id: string): Promise<CronJob | null> {
    return this.scheduler.resumeJob(id);
  }
  
  /**
   * Trigger a job to run immediately
   */
  public async triggerJobNow(id: string): Promise<CronJob | null> {
    // Check rate limit
    if (!this.triggerJobRateLimiter.tryAcquire()) {
      throw new Error('Rate limit exceeded for job triggering');
    }
    
    return this.scheduler.triggerJobNow(id);
  }
  
  /**
   * Get GraphQL schema
   */
  public getSchema(): string {
    return `
      scalar DateTime
      scalar Cron
      scalar JSON

      type TaskPayload {
        type: String!
        data: JSON!
      }

      enum JobStatus {
        SCHEDULED
        RUNNING
        COMPLETED
        FAILED
        PAUSED
        CANCELED
      }

      type CronJob {
        id: ID!
        name: String!
        schedule: Cron!
        task: TaskPayload!
        lastRun: DateTime
        nextRun: DateTime
        status: JobStatus!
        retryAttempts: Int!
        maxRetries: Int!
        tags: [String!]!
        createdAt: DateTime!
        updatedAt: DateTime!
      }

      input TaskPayloadInput {
        type: String!
        data: JSON!
      }

      input CronJobInput {
        name: String!
        schedule: Cron!
        task: TaskPayloadInput!
        maxRetries: Int = 3
        tags: [String!]
      }

      type Query {
        jobs: [CronJob!]!
        job(id: ID!): CronJob
        jobsByTag(tag: String!): [CronJob!]!
        jobsByStatus(status: JobStatus!): [CronJob!]!
      }

      type Mutation {
        createJob(input: CronJobInput!): CronJob!
        updateJob(id: ID!, input: CronJobInput!): CronJob!
        deleteJob(id: ID!): Boolean!
        pauseJob(id: ID!): CronJob!
        resumeJob(id: ID!): CronJob!
        triggerJobNow(id: ID!): CronJob!
      }

      type Subscription {
        jobStatusChanged: CronJob!
        jobCompleted: CronJob!
        jobFailed: CronJob!
      }
    `;
  }
  
  /**
   * Get GraphQL resolvers
   */
  public getResolvers(): any {
    return createResolvers(this.scheduler as any);
  }
  
  /**
   * Execute a task in the web worker
   */
  public executeTaskInWorker(taskType: string, payload: any): Promise<any> {
    if (!this.worker) {
      throw new Error('Web Worker is not available');
    }
    
    return new Promise((resolve, reject) => {
      const jobId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      const messageHandler = (event: MessageEvent) => {
        const { type, jobId: responseJobId, result, error } = event.data;
        
        if (responseJobId !== jobId) {
          return; // Not our response
        }
        
        if (type === 'TASK_COMPLETED') {
          this.worker!.removeEventListener('message', messageHandler);
          resolve(result);
        } else if (type === 'ERROR' || type === 'TASK_FAILED') {
          this.worker!.removeEventListener('message', messageHandler);
          reject(new Error(error));
        }
      };
      
      this.worker.addEventListener('message', messageHandler);
      
      this.worker.postMessage({
        type: 'EXECUTE_TASK',
        jobId,
        data: {
          taskType,
          payload
        }
      });
    });
  }
  
  /**
   * Validate a cron expression in the web worker
   */
  public validateCronExpression(expression: string): Promise<boolean> {
    if (!this.worker) {
      // Fallback to simple validation
      try {
        const parts = expression.split(' ');
        return Promise.resolve(parts.length >= 5 && parts.length <= 6);
      } catch (error) {
        return Promise.resolve(false);
      }
    }
    
    return new Promise((resolve) => {
      const jobId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      const messageHandler = (event: MessageEvent) => {
        const { type, jobId: responseJobId, isValid } = event.data;
        
        if (responseJobId !== jobId) {
          return; // Not our response
        }
        
        if (type === 'CRON_VALIDATION') {
          this.worker!.removeEventListener('message', messageHandler);
          resolve(isValid);
        }
      };
      
      this.worker.addEventListener('message', messageHandler);
      
      this.worker.postMessage({
        type: 'VALIDATE_CRON',
        jobId,
        data: {
          expression
        }
      });
    });
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stop();
    this.broadcastService.close();
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// TypeScript type exports
export type {
  CronJobInput,
  CronJob,
  TaskPayload,
  TaskHandler,
  CronJobConfiguration
};

// Default export
export default GraphQLCron;