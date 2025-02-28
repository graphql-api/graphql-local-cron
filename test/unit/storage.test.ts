import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { IndexedDBStorage } from '../../src/storage/indexeddb';
import { JobStatus } from '../../src/types';
import { openDB } from 'idb';

// Mock idb
vi.mock('idb', () => ({
  openDB: vi.fn()
}));

describe('IndexedDBStorage', () => {
  let storage: IndexedDBStorage;
  const mockDB = {
    get: vi.fn(),
    getAll: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(() => ({
      store: {
        index: vi.fn(() => ({
          getAll: vi.fn()
        }))
      },
      objectStore: vi.fn(() => ({
        index: vi.fn(() => ({
          getAll: vi.fn()
        })),
        get: vi.fn(),
        getAll: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn()
      })),
      done: Promise.resolve()
    }))
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (openDB as any).mockResolvedValue(mockDB);
    storage = new IndexedDBStorage('test');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize the database', () => {
    expect(openDB).toHaveBeenCalled();
  });

  it('should get a job by ID', async () => {
    const mockJob = {
      id: '123',
      name: 'Test Job',
      status: JobStatus.SCHEDULED
    };
    
    mockDB.get.mockResolvedValue(mockJob);
    
    const job = await storage.getJob('123');
    
    expect(job).toEqual(mockJob);
    expect(mockDB.get).toHaveBeenCalledWith('jobs', '123');
  });

  it('should get all jobs', async () => {
    const mockJobs = [
      { id: '123', name: 'Job 1', status: JobStatus.SCHEDULED },
      { id: '456', name: 'Job 2', status: JobStatus.PAUSED }
    ];
    
    mockDB.getAll.mockResolvedValue(mockJobs);
    
    const jobs = await storage.getJobs();
    
    expect(jobs).toEqual(mockJobs);
    expect(mockDB.getAll).toHaveBeenCalledWith('jobs');
  });

  it('should create a new job', async () => {
    const jobData = {
      name: 'New Job',
      schedule: '* * * * *',
      task: { type: 'TEST', data: {} },
      status: JobStatus.SCHEDULED,
      maxRetries: 3,
      retryAttempts: 0,
      tags: ['test'],
      nextRun: new Date()
    };
    
    mockDB.put.mockResolvedValue('123');
    
    const job = await storage.createJob(jobData);
    
    expect(job).toBeDefined();
    expect(job.id).toBeDefined();
    expect(job.name).toBe('New Job');
    expect(mockDB.put).toHaveBeenCalled();
  });

  it('should update an existing job', async () => {
    const existingJob = {
      id: '123',
      name: 'Old Name',
      schedule: '* * * * *',
      task: { type: 'TEST', data: {} },
      status: JobStatus.SCHEDULED,
      maxRetries: 3,
      retryAttempts: 0,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updates = {
      name: 'New Name',
      status: JobStatus.PAUSED
    };
    
    mockDB.get.mockResolvedValue(existingJob);
    mockDB.put.mockResolvedValue('123');
    
    const job = await storage.updateJob('123', updates);
    
    expect(job).toBeDefined();
    expect(job!.name).toBe('New Name');
    expect(job!.status).toBe(JobStatus.PAUSED);
    expect(mockDB.get).toHaveBeenCalledWith('jobs', '123');
    expect(mockDB.put).toHaveBeenCalled();
  });

  it('should delete a job', async () => {
    mockDB.get.mockResolvedValue({ id: '123', name: 'Test Job' });
    mockDB.delete.mockResolvedValue(undefined);
    
    const result = await storage.deleteJob('123');
    
    expect(result).toBe(true);
    expect(mockDB.delete).toHaveBeenCalledWith('jobs', '123');
  });
});