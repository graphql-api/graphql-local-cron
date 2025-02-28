import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { 
  CronJob,
  JobStatus,
  StorageAdapter
} from '../types';

const DB_NAME = 'graphql-cron-jobs';
const DB_VERSION = 1;
const JOB_STORE = 'jobs';

export class IndexedDBStorage implements StorageAdapter {
  private dbPromise: Promise<IDBPDatabase>;
  private storagePrefix: string;

  constructor(prefix: string = '') {
    this.storagePrefix = prefix;
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBPDatabase> {
    const dbName = this.storagePrefix ? `${this.storagePrefix}-${DB_NAME}` : DB_NAME;
    
    return openDB(dbName, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(JOB_STORE)) {
          const jobStore = db.createObjectStore(JOB_STORE, { 
            keyPath: 'id' 
          });
          
          // Create indexes for efficient querying
          jobStore.createIndex('status', 'status', { unique: false });
          jobStore.createIndex('nextRun', 'nextRun', { unique: false });
          jobStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          jobStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      }
    });
  }

  async getJob(id: string): Promise<CronJob | null> {
    const db = await this.dbPromise;
    return db.get(JOB_STORE, id) || null;
  }

  async getJobs(): Promise<CronJob[]> {
    const db = await this.dbPromise;
    return db.getAll(JOB_STORE);
  }

  async getJobsByTag(tag: string): Promise<CronJob[]> {
    const db = await this.dbPromise;
    const index = db.transaction(JOB_STORE).store.index('tags');
    return index.getAll(tag);
  }

  async getJobsByStatus(status: JobStatus): Promise<CronJob[]> {
    const db = await this.dbPromise;
    const index = db.transaction(JOB_STORE).store.index('status');
    return index.getAll(status);
  }

  async createJob(job: Omit<CronJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<CronJob> {
    const db = await this.dbPromise;
    const now = new Date();
    
    const newJob: CronJob = {
      ...job,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      retryAttempts: 0,
      tags: job.tags || []
    };
    
    await db.put(JOB_STORE, newJob);
    return newJob;
  }

  async updateJob(id: string, jobUpdate: Partial<CronJob>): Promise<CronJob | null> {
    const db = await this.dbPromise;
    
    // Get the existing job
    const existingJob = await this.getJob(id);
    if (!existingJob) {
      return null;
    }
    
    // Create updated job
    const updatedJob: CronJob = {
      ...existingJob,
      ...jobUpdate,
      id, // Ensure ID remains the same
      updatedAt: new Date()
    };
    
    await db.put(JOB_STORE, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    
    // Check if job exists
    const job = await this.getJob(id);
    if (!job) {
      return false;
    }
    
    await db.delete(JOB_STORE, id);
    return true;
  }

  async deleteAllJobs(): Promise<boolean> {
    const db = await this.dbPromise;
    const tx = db.transaction(JOB_STORE, 'readwrite');
    await tx.objectStore(JOB_STORE).clear();
    await tx.done;
    return true;
  }

  // Helper method to cleanup old jobs
  async cleanupJobs(olderThanDays: number): Promise<number> {
    const db = await this.dbPromise;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const tx = db.transaction(JOB_STORE, 'readwrite');
    const store = tx.objectStore(JOB_STORE);
    
    const jobs = await store.getAll();
    let deletedCount = 0;
    
    for (const job of jobs) {
      if (
        (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED || job.status === JobStatus.CANCELED) &&
        job.updatedAt < cutoffDate
      ) {
        await store.delete(job.id);
        deletedCount++;
      }
    }
    
    await tx.done;
    return deletedCount;
  }
}