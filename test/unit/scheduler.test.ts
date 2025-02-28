import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CronScheduler } from '../../src/scheduler/scheduler';
import { BroadcastService, TaskRegistry } from '../../src/services/broadcast';
import { IndexedDBStorage } from '../../src/storage/indexeddb';
import { JobStatus } from '../../src/types';

// Mocks
vi.mock('../../src/storage/indexeddb');
vi.mock('../../src/services/broadcast');

describe('CronScheduler', () => {
  let scheduler: CronScheduler;
  let storage: IndexedDBStorage;
  let registry: TaskRegistry;
  let broadcast: BroadcastService;

  beforeEach(() => {
    storage = new IndexedDBStorage('test');
    registry = new TaskRegistry();
    broadcast = new BroadcastService('test-channel');
    
    scheduler = new CronScheduler(
      storage,
      registry,
      broadcast,
      {
        maxConcurrentJobs: 2,
        defaultMaxRetries: 3,
        jobExpirationDays: 7,
        schedulerCheckInterval: 1000
      }
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be initialized with proper configuration', () => {
    expect(scheduler).toBeDefined();
  });

  it('should start the scheduler', () => {
    const spy = vi.spyOn(global, 'setInterval');
    scheduler.start();
    expect(spy).toHaveBeenCalled();
  });

  it('should stop the scheduler', () => {
    const spy = vi.spyOn(global, 'clearInterval');
    scheduler.start();
    scheduler.stop();
    expect(spy).toHaveBeenCalled();
  });

  it('should create a job', async () => {
    vi.spyOn(storage, 'createJob').mockResolvedValue({
      id: '123',
      name: 'Test Job',
      schedule: '* * * * *',
      task: { type: 'TEST', data: {} },
      status: JobStatus.SCHEDULED,
      retryAttempts: 0,
      maxRetries: 3,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const job = await scheduler.createJob({
      name: 'Test Job',
      schedule: '* * * * *',
      task: { type: 'TEST', data: {} },
      tags: ['test']
    });

    expect(job).toBeDefined();
    expect(job.id).toBe('123');
    expect(storage.createJob).toHaveBeenCalled();
  });

  it('should update a job', async () => {
    vi.spyOn(storage, 'getJob').mockResolvedValue({
      id: '123',
      name: 'Old Name',
      schedule: '* * * * *',
      task: { type: 'TEST', data: {} },
      status: JobStatus.SCHEDULED,
      retryAttempts: 0,
      maxRetries: 3,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    vi.spyOn(storage, 'updateJob').mockResolvedValue({
      id: '123',
      name: 'New Name',
      schedule: '* * * * *',
      task: { type: 'TEST', data: { updated: true } },
      status: JobStatus.SCHEDULED,
      retryAttempts: 0,
      maxRetries: 3,
      tags: ['test', 'updated'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const job = await scheduler.updateJob('123', {
      name: 'New Name',
      schedule: '* * * * *',
      task: { type: 'TEST', data: { updated: true } },
      tags: ['test', 'updated']
    });

    expect(job).toBeDefined();
    expect(job!.name).toBe('New Name');
    expect(storage.getJob).toHaveBeenCalledWith('123');
    expect(storage.updateJob).toHaveBeenCalled();
  });

  it('should pause a job', async () => {
    vi.spyOn(storage, 'getJob').mockResolvedValue({
      id: '123',
      name: 'Test Job',
      schedule: '* * * * *',
      task: { type: 'TEST', data: {} },
      status: JobStatus.SCHEDULED,
      retryAttempts: 0,
      maxRetries: 3,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    vi.spyOn(storage, 'updateJob').mockResolvedValue({
      id: '123',
      name: 'Test Job',
      schedule: '* * * * *',
      task: { type: 'TEST', data: {} },
      status: JobStatus.PAUSED,
      retryAttempts: 0,
      maxRetries: 3,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const job = await scheduler.pauseJob('123');

    expect(job).toBeDefined();
    expect(job!.status).toBe(JobStatus.PAUSED);
    expect(storage.getJob).toHaveBeenCalledWith('123');
    expect(storage.updateJob).toHaveBeenCalled();
  });
});