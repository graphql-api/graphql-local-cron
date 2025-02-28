import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { GraphQLCron, JobStatus } from '@graphql-local/cron';
import { QUERIES, MUTATIONS } from '@graphql-local/cron/client';

// Initialize the cron system
const cron = new GraphQLCron();

// Register task handlers
cron.registerTaskHandler('FETCH', async (payload, context) => {
  try {
    const response = await fetch(payload.data.url);
    const data = await response.json();
    
    return {
      success: true,
      data
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

// Create Apollo Client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  typeDefs: cron.getSchema(),
  resolvers: cron.getResolvers()
});

// Example: Create a job using Apollo Client
async function createJob() {
  const { data } = await client.mutate({
    mutation: MUTATIONS.CREATE_JOB,
    variables: {
      input: {
        name: 'Fetch API Data',
        schedule: '*/30 * * * *', // Every 30 minutes
        task: {
          type: 'FETCH',
          data: { url: 'https://api.example.com/data' }
        },
        maxRetries: 3,
        tags: ['api', 'data-sync']
      }
    }
  });
  
  console.log('Created job:', data.createJob);
  return data.createJob.id;
}

// Example: Get all jobs using Apollo Client
async function getJobs() {
  const { data } = await client.query({
    query: QUERIES.GET_JOBS
  });
  
  console.log('All jobs:', data.jobs);
  return data.jobs;
}

// Example: Get jobs by tag using Apollo Client
async function getJobsByTag(tag) {
  const { data } = await client.query({
    query: QUERIES.GET_JOBS_BY_TAG,
    variables: { tag }
  });
  
  console.log(`Jobs with tag '${tag}':`, data.jobsByTag);
  return data.jobsByTag;
}

// Example: Trigger a job immediately using Apollo Client
async function triggerJobNow(id) {
  const { data } = await client.mutate({
    mutation: MUTATIONS.TRIGGER_JOB_NOW,
    variables: { id }
  });
  
  console.log('Triggered job:', data.triggerJobNow);
  return data.triggerJobNow;
}

// Demo execution sequence
async function runDemo() {
  try {
    const jobId = await createJob();
    await getJobs();
    await getJobsByTag('api');
    await triggerJobNow(jobId);
  } catch (error) {
    console.error('Error in demo:', error);
  }
}

// Execute demo
runDemo();