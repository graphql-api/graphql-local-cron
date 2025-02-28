import * as cronParser from 'cron-parser';
import { v4 as uuidv4 } from 'uuid';
import { StorageAdapter, CronJob, JobStatus, CronJobInput, TaskRegistry, JobExecutionContext, TaskHandler } from '../types';
import { validateCronExpression } from '../utils/validation';
import { BroadcastService } from '../services/broadcast';

export class CronScheduler {
  private storageAdapter: StorageAdapter;
  private taskRegistry: TaskRegistry;
  private broadcastService: BroadcastService;
  private schedulerIntervalId: number | null = null;
  private runningJobs: Set<string> = new Set();
  private maxConcurrentJobs: number;
  private defaultMaxRetries: number;
  private jobExpirationDays: number;
  private schedulerCheckInterval: number = 10000; // 10 seconds by default
  private isPageVisible: boolean = true;
  private isOnline: boolean = navigator.onLine;

  constructor(
    storageAdapter: StorageAdapter,
    taskRegistry: TaskRegistry,
    broadcastService: BroadcastService,
    options: {
      maxConcurrentJobs?: number;
      defaultMaxRetries?: number;
      jobExpirationDays?: number;
      schedulerCheckInterval?: number;
    } = {}
  ) {
    this.storageAdapter = storageAdapter;
    this.taskRegistry = taskRegistry;
    this.broadcastService = broadcastService;
    this.maxConcurrentJobs = options.maxConcurrentJobs || 5;
    this.defaultMaxRetries = options.defaultMaxRetries || 3;
    this.jobExpirationDays = options.jobExpirationDays || 30;
    
    if (options.schedulerCheckInterval) {
      this.schedulerCheckInterval = options.schedulerCheckInterval;
    }

    // Initialize page visibility monitoring
    this.initPageVisibility();
    
    // Initialize online status monitoring
    this.initOnlineStatus();
    
    // Listen for job execution events from other tabs
    this.initBroadcastListeners();
  }

  private initPageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = document.visibilityState === 'visible';
      
      if (this.isPageVisible) {
        // When page becomes visible, check for jobs that need to run
        this.checkForDueJobs();
      }
    });
  }

  private initOnlineStatus(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      // When we come back online, check for jobs that need to run
      this.checkForDueJobs();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private initBroadcastListeners(): void {
    this.broadcastService.subscribe('JOB_COMPLETED', (data) => {
      const { jobId } = data;
      this.runningJobs.delete(jobId);
      // Check if we can now run more jobs
      this.checkForDueJobs();
    });
    
    this.broadcastService.subscribe('JOB_STARTED', (data) => {
      const { jobId } = data;
      // Mark job as running in this instance too to prevent duplicate execution
      this.runningJobs.add(jobId);
    });
  }

  public start(): void {
    if (this.schedulerIntervalId !== null) {
      return; // Already started
    }
    
    // Immediately check for due jobs
    this.checkForDueJobs();
    
    // Set up interval to check for jobs
    this.schedulerIntervalId = window.setInterval(() => {
      this.checkForDueJobs();
    }, this.schedulerCheckInterval);
    
    // Clean up old jobs
    this.cleanupExpiredJobs();
    
    console.log('Cron scheduler started');
  }

  public stop(): void {
    if (this.schedulerIntervalId !== null) {
      clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
      console.log('Cron scheduler stopped');
    }
  }

  private async checkForDueJobs(): Promise<void> {
    // If offline or not visible, don't process jobs
    if (!this.isOnline || !this.isPageVisible) {
      return;
    }

    // If we're already running the maximum number of jobs, don't start more
    if (this.runningJobs.size >= this.maxConcurrentJobs) {
      return;
    }
    
    try {
      // Get all scheduled jobs
      const jobs = await this.storageAdapter.getJobsByStatus(JobStatus.SCHEDULED);
      const now = new Date();
      
      // Find jobs that are due to run
      const dueJobs = jobs.filter(job => {
        if (!job.nextRun) return false;
        return new Date(job.nextRun) <= now;
      });
      
      // Sort jobs by next run time (oldest first)
      dueJobs.sort((a, b) => {
        const aTime = a.nextRun ? new Date(a.nextRun).getTime() : 0;
        const bTime = b.nextRun ? new Date(b.nextRun).getTime() : 0;
        return aTime - bTime;
      });
      
      // Execute jobs, but respect max concurrent limit
      for (const job of dueJobs) {
        if (this.runningJobs.size >= this.maxConcurrentJobs) {
          break;
        }
        
        if (!this.runningJobs.has(job.id)) {
          this.executeJob(job).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Error checking for due jobs:', error);
    }
  }

  private async executeJob(job: CronJob): Promise<void> {
    // Mark job as running both locally and in storage
    this.runningJobs.add(job.id);
    
    // Notify other tabs that this job is being executed
    this.broadcastService.publish('JOB_STARTED', { jobId: job.id });
    
    try {
      // Update job status to RUNNING
      const updatedJob = await this.storageAdapter.updateJob(job.id, {
        status: JobStatus.RUNNING,
        lastRun: new Date()
      });
      
      if (!updatedJob) {
        throw new Error(`Failed to update job ${job.id} status to RUNNING`);
      }
      
      // Calculate next run time
      const nextRun = this.calculateNextRun(job.schedule);
      
      // Get the task handler for this job type
      const taskHandler = this.taskRegistry.getTaskHandler(job.task.type);
      
      if (!taskHandler) {
        throw new Error(`No handler registered for task type: ${job.task.type}`);
      }
      
      // Execute the task
      const result = await this.executeTask(taskHandler, job);
      
      if (result.success) {
        // Update job with success status
        await this.storageAdapter.updateJob(job.id, {
          status: JobStatus.SCHEDULED, // Reset to scheduled for next run
          nextRun,
          lastRun: new Date(),
          retryAttempts: 0 // Reset retry attempts on success
        });
        
        // Publish job completed event
        this.broadcastService.publish('JOB_COMPLETED', {
          jobId: job.id,
          success: true,
          data: result.data
        });
      } else {
        // Handle failure
        const retryAttempts = (job.retryAttempts || 0) + 1;
        const maxRetries = job.maxRetries || this.defaultMaxRetries;
        
        if (retryAttempts <= maxRetries) {
          // Update with retry information
          await this.storageAdapter.updateJob(job.id, {
            status: JobStatus.SCHEDULED, // Keep as scheduled for retry
            nextRun: this.calculateRetryTime(retryAttempts),
            retryAttempts
          });
          
          this.broadcastService.publish('JOB_FAILED', {
            jobId: job.id,
            error: result.error?.message || 'Unknown error',
            willRetry: true,
            retryAttempt: retryAttempts,
            maxRetries
          });
        } else {
          // Max retries reached, mark as failed
          await this.storageAdapter.updateJob(job.id, {
            status: JobStatus.FAILED,
            retryAttempts
          });
          
          this.broadcastService.publish('JOB_FAILED', {
            jobId: job.id,
            error: result.error?.message || 'Unknown error',
            willRetry: false,
            retryAttempt: retryAttempts,
            maxRetries
          });
        }
      }
    } catch (error) {
      console.error(`Error executing job ${job.id}:`, error);
      
      // Update job as failed in case of unexpected error
      await this.storageAdapter.updateJob(job.id, {
        status: JobStatus.FAILED,
        retryAttempts: (job.retryAttempts || 0) + 1
      });
      
      this.broadcastService.publish('JOB_FAILED', {
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        willRetry: false
      });
    } finally {
      // Remove job from running set
      this.runningJobs.delete(job.id);
      
      // Notify other tabs that this job is no longer being executed
      this.broadcastService.publish('JOB_COMPLETED', { jobId: job.id });
    }
  }

  private async executeTask(
    taskHandler: TaskHandler,
    job: CronJob
  ): Promise<{ success: boolean; error?: Error; data?: any }> {
    const context: JobExecutionContext = {
      jobId: job.id,
      retryCount: job.retryAttempts,
      startTime: new Date(),
      payload: job.task
    };
    
    try {
      // Execute the task with timeout
      const result = await Promise.race([
        taskHandler(job.task, context),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Task execution timed out')), 30000); // 30-second timeout
        })
      ]);
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  private calculateNextRun(cronExpression: string): Date {
    try {
      const interval = cronParser.parseExpression(cronExpression);
      return interval.next().toDate();
    } catch (error) {
      console.error('Error calculating next run time:', error);
      // Fallback to running again in 1 hour if parsing fails
      const fallbackDate = new Date();
      fallbackDate.setHours(fallbackDate.getHours() + 1);
      return fallbackDate;
    }
  }

  private calculateRetryTime(retryAttempt: number): Date {
    // Implement exponential backoff for retries
    const delaySeconds = Math.min(Math.pow(2, retryAttempt) * 10, 3600); // Max 1 hour delay
    const retryTime = new Date();
    retryTime.setSeconds(retryTime.getSeconds() + delaySeconds);
    return retryTime;
  }

  public async createJob(input: CronJobInput): Promise<CronJob> {
    // Validate cron expression
    if (!validateCronExpression(input.schedule)) {
      throw new Error(`Invalid cron expression: ${input.schedule}`);
    }
    
    // Calculate initial next run time
    const nextRun = this.calculateNextRun(input.schedule);
    
    // Create new job
    const newJob = await this.storageAdapter.createJob({
      name: input.name,
      schedule: input.schedule,
      task: input.task,
      nextRun,
      status: JobStatus.SCHEDULED,
      retryAttempts: 0,
      maxRetries: input.maxRetries || this.defaultMaxRetries,
      tags: input.tags || []
    });
    
    // Notify other tabs about the new job
    this.broadcastService.publish('JOB_CREATED', { job: newJob });
    
    return newJob;
  }

  public async updateJob(id: string, input: CronJobInput): Promise<CronJob | null> {
    // Validate cron expression
    if (!validateCronExpression(input.schedule)) {
      throw new Error(`Invalid cron expression: ${input.schedule}`);
    }
    
    // Get existing job
    const existingJob = await this.storageAdapter.getJob(id);
    if (!existingJob) {
      return null;
    }
    
    // Calculate next run time if schedule changed
    let nextRun = existingJob.nextRun;
    if (input.schedule !== existingJob.schedule) {
      nextRun = this.calculateNextRun(input.schedule);
    }
    
    // Update job
    const updatedJob = await this.storageAdapter.updateJob(id, {
      name: input.name,
      schedule: input.schedule,
      task: input.task,
      nextRun,
      maxRetries: input.maxRetries || existingJob.maxRetries,
      tags: input.tags || existingJob.tags
    });
    
    if (updatedJob) {
      // Notify other tabs about the updated job
      this.broadcastService.publish('JOB_UPDATED', { job: updatedJob });
    }
    
    return updatedJob;
  }

  public async deleteJob(id: string): Promise<boolean> {
    const result = await this.storageAdapter.deleteJob(id);
    
    if (result) {
      // Notify other tabs about the deleted job
      this.broadcastService.publish('JOB_DELETED', { jobId: id });
    }
    
    return result;
  }

  public async pauseJob(id: string): Promise<CronJob | null> {
    // Get existing job
    const existingJob = await this.storageAdapter.getJob(id);
    if (!existingJob) {
      return null;
    }
    
    // Only scheduled jobs can be paused
    if (existingJob.status !== JobStatus.SCHEDULED) {
      throw new Error(`Cannot pause job with status: ${existingJob.status}`);
    }
    
    // Update job status to PAUSED
    const updatedJob = await this.storageAdapter.updateJob(id, {
      status: JobStatus.PAUSED
    });
    
    if (updatedJob) {
      // Notify other tabs about the paused job
      this.broadcastService.publish('JOB_STATUS_CHANGED', {
        jobId: id,
        status: JobStatus.PAUSED
      });
    }
    
    return updatedJob;
  }

  public async resumeJob(id: string): Promise<CronJob | null> {
    // Get existing job
    const existingJob = await this.storageAdapter.getJob(id);
    if (!existingJob) {
      return null;
    }
    
    // Only paused jobs can be resumed
    if (existingJob.status !== JobStatus.PAUSED) {
      throw new Error(`Cannot resume job with status: ${existingJob.status}`);
    }
    
    // Calculate next run time
    const nextRun = this.calculateNextRun(existingJob.schedule);
    
    // Update job status to SCHEDULED
    const updatedJob = await this.storageAdapter.updateJob(id, {
      status: JobStatus.SCHEDULED,
      nextRun
    });
    
    if (updatedJob) {
      // Notify other tabs about the resumed job
      this.broadcastService.publish('JOB_STATUS_CHANGED', {
        jobId: id,
        status: JobStatus.SCHEDULED
      });
    }
    
    return updatedJob;
  }

  public async triggerJobNow(id: string): Promise<CronJob | null> {
    // Get existing job
    const existingJob = await this.storageAdapter.getJob(id);
    if (!existingJob) {
      return null;
    }
    
    // Only scheduled or paused jobs can be triggered
    if (existingJob.status !== JobStatus.SCHEDULED && existingJob.status !== JobStatus.PAUSED) {
      throw new Error(`Cannot trigger job with status: ${existingJob.status}`);
    }
    
    // Set next run to now
    const updatedJob = await this.storageAdapter.updateJob(id, {
      status: JobStatus.SCHEDULED,
      nextRun: new Date()
    });
    
    if (updatedJob) {
      // Notify other tabs about the triggered job
      this.broadcastService.publish('JOB_TRIGGERED', { jobId: id });
      
      // Check for due jobs immediately
      this.checkForDueJobs();
    }
    
    return updatedJob;
  }

  private async cleanupExpiredJobs(): Promise<void> {
    try {
      const deletedCount = await (this.storageAdapter as any).cleanupJobs(this.jobExpirationDays);
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} expired jobs`);
      }
    } catch (error) {
      console.error('Error cleaning up expired jobs:', error);
    }
  }
}