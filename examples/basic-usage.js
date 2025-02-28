import { GraphQLCron, JobStatus } from '@graphql-local/cron';

// Initialize the cron system
const cron = new GraphQLCron({
  storagePrefix: 'example-app',
  maxConcurrentJobs: 2,
  enableNotifications: true
});

// Register task handlers
cron.registerTaskHandler('LOG', async (payload, context) => {
  try {
    console.log(`[LOG TASK] ${payload.data.message}`);
    
    return {
      success: true,
      data: { logged: true, timestamp: new Date() }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
});

// Start the scheduler
cron.start();

// Create a new job
async function createLogJob() {
  const job = await cron.createJob({
    name: 'Log Message',
    schedule: '*/1 * * * *', // Run every minute
    task: {
      type: 'LOG',
      data: {
        message: 'This is a scheduled log message'
      }
    },
    maxRetries: 3,
    tags: ['logs', 'debug']
  });
  
  console.log('Created job:', job);
}

// Get all jobs
async function listAllJobs() {
  const jobs = await cron.getJobs();
  console.log('All jobs:', jobs);
}

// Get jobs by tag
async function getJobsByTag(tag) {
  const jobs = await cron.getJobsByTag(tag);
  console.log(`Jobs with tag '${tag}':`, jobs);
}

// Pause a job
async function pauseJob(id) {
  const job = await cron.pauseJob(id);
  console.log('Paused job:', job);
}

// Resume a job
async function resumeJob(id) {
  const job = await cron.resumeJob(id);
  console.log('Resumed job:', job);
}

// Run a job immediately
async function triggerJobNow(id) {
  const job = await cron.triggerJobNow(id);
  console.log('Triggered job:', job);
}

// Delete a job
async function deleteJob(id) {
  const result = await cron.deleteJob(id);
  console.log('Deleted job:', result);
}

// Example usage sequence
createLogJob()
  .then(() => listAllJobs())
  .then(() => getJobsByTag('logs'))
  .catch(error => console.error('Error:', error));