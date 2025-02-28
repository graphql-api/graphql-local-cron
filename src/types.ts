import { GraphQLResolveInfo } from 'graphql';

export enum JobStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED',
  CANCELED = 'CANCELED'
}

export interface TaskPayload {
  type: string;
  data: Record<string, any>;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  task: TaskPayload;
  lastRun?: Date | null;
  nextRun?: Date | null;
  status: JobStatus;
  retryAttempts: number;
  maxRetries: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskPayloadInput {
  type: string;
  data: Record<string, any>;
}

export interface CronJobInput {
  name: string;
  schedule: string;
  task: TaskPayloadInput;
  maxRetries?: number;
  tags?: string[];
}

export interface JobExecutionContext {
  jobId: string;
  retryCount: number;
  startTime: Date;
  payload: TaskPayload;
}

export interface JobExecutionResult {
  success: boolean;
  error?: Error;
  data?: any;
}

export interface TaskHandler {
  (payload: TaskPayload, context: JobExecutionContext): Promise<JobExecutionResult>;
}

export interface TaskRegistry {
  registerTask(type: string, handler: TaskHandler): void;
  getTaskHandler(type: string): TaskHandler | undefined;
}

export interface StorageAdapter {
  getJob(id: string): Promise<CronJob | null>;
  getJobs(): Promise<CronJob[]>;
  getJobsByTag(tag: string): Promise<CronJob[]>;
  getJobsByStatus(status: JobStatus): Promise<CronJob[]>;
  createJob(job: Omit<CronJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<CronJob>;
  updateJob(id: string, job: Partial<CronJob>): Promise<CronJob | null>;
  deleteJob(id: string): Promise<boolean>;
}

export interface BroadcastMessage {
  type: string;
  payload: any;
}

export interface CronJobConfiguration {
  storagePrefix?: string;
  broadcastChannelName?: string;
  maxConcurrentJobs?: number;
  defaultMaxRetries?: number;
  jobExpirationDays?: number;
  enableNotifications?: boolean;
  rateLimits?: {
    createJob: number; // jobs per minute
    triggerJob: number; // triggers per minute
  };
}

export interface Resolvers {
  Query: {
    jobs: (parent: any, args: any, context: any, info: GraphQLResolveInfo) => Promise<CronJob[]>;
    job: (parent: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => Promise<CronJob | null>;
    jobsByTag: (parent: any, args: { tag: string }, context: any, info: GraphQLResolveInfo) => Promise<CronJob[]>;
    jobsByStatus: (parent: any, args: { status: JobStatus }, context: any, info: GraphQLResolveInfo) => Promise<CronJob[]>;
  };
  Mutation: {
    createJob: (parent: any, args: { input: CronJobInput }, context: any, info: GraphQLResolveInfo) => Promise<CronJob>;
    updateJob: (parent: any, args: { id: string; input: CronJobInput }, context: any, info: GraphQLResolveInfo) => Promise<CronJob | null>;
    deleteJob: (parent: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => Promise<boolean>;
    pauseJob: (parent: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => Promise<CronJob | null>;
    resumeJob: (parent: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => Promise<CronJob | null>;
    triggerJobNow: (parent: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => Promise<CronJob | null>;
  };
  Subscription: {
    jobStatusChanged: {
      subscribe: () => AsyncIterator<{ jobStatusChanged: CronJob }>;
    };
    jobCompleted: {
      subscribe: () => AsyncIterator<{ jobCompleted: CronJob }>;
    };
    jobFailed: {
      subscribe: () => AsyncIterator<{ jobFailed: CronJob }>;
    };
  };
}