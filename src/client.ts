import { gql } from 'graphql-tag';

// Define query and mutation operations for client-side usage
const QUERIES = {
  GET_JOBS: gql`
    query GetJobs {
      jobs {
        id
        name
        schedule
        task {
          type
          data
        }
        lastRun
        nextRun
        status
        retryAttempts
        maxRetries
        tags
        createdAt
        updatedAt
      }
    }
  `,
  
  GET_JOB: gql`
    query GetJob($id: ID!) {
      job(id: $id) {
        id
        name
        schedule
        task {
          type
          data
        }
        lastRun
        nextRun
        status
        retryAttempts
        maxRetries
        tags
        createdAt
        updatedAt
      }
    }
  `,
  
  GET_JOBS_BY_TAG: gql`
    query GetJobsByTag($tag: String!) {
      jobsByTag(tag: $tag) {
        id
        name
        schedule
        task {
          type
          data
        }
        lastRun
        nextRun
        status
        retryAttempts
        maxRetries
        tags
        createdAt
        updatedAt
      }
    }
  `,
  
  GET_JOBS_BY_STATUS: gql`
    query GetJobsByStatus($status: JobStatus!) {
      jobsByStatus(status: $status) {
        id
        name
        schedule
        task {
          type
          data
        }
        lastRun
        nextRun
        status
        retryAttempts
        maxRetries
        tags
        createdAt
        updatedAt
      }
    }
  `
};

const MUTATIONS = {
  CREATE_JOB: gql`
    mutation CreateJob($input: CronJobInput!) {
      createJob(input: $input) {
        id
        name
        schedule
        task {
          type
          data
        }
        lastRun
        nextRun
        status
        retryAttempts
        maxRetries
        tags
        createdAt
        updatedAt
      }
    }
  `,
  
  UPDATE_JOB: gql`
    mutation UpdateJob($id: ID!, $input: CronJobInput!) {
      updateJob(id: $id, input: $input) {
        id
        name
        schedule
        task {
          type
          data
        }
        lastRun
        nextRun
        status
        retryAttempts
        maxRetries
        tags
        createdAt
        updatedAt
      }
    }
  `,
  
  DELETE_JOB: gql`
    mutation DeleteJob($id: ID!) {
      deleteJob(id: $id)
    }
  `,
  
  PAUSE_JOB: gql`
    mutation PauseJob($id: ID!) {
      pauseJob(id: $id) {
        id
        status
        updatedAt
      }
    }
  `,
  
  RESUME_JOB: gql`
    mutation ResumeJob($id: ID!) {
      resumeJob(id: $id) {
        id
        status
        nextRun
        updatedAt
      }
    }
  `,
  
  TRIGGER_JOB_NOW: gql`
    mutation TriggerJobNow($id: ID!) {
      triggerJobNow(id: $id) {
        id
        status
        nextRun
        updatedAt
      }
    }
  `
};

const SUBSCRIPTIONS = {
  JOB_STATUS_CHANGED: gql`
    subscription OnJobStatusChanged {
      jobStatusChanged {
        id
        name
        status
        updatedAt
      }
    }
  `,
  
  JOB_COMPLETED: gql`
    subscription OnJobCompleted {
      jobCompleted {
        id
        name
        lastRun
        status
        updatedAt
      }
    }
  `,
  
  JOB_FAILED: gql`
    subscription OnJobFailed {
      jobFailed {
        id
        name
        lastRun
        status
        retryAttempts
        maxRetries
        updatedAt
      }
    }
  `
};

// Export operations for use with GraphQL clients
export { QUERIES, MUTATIONS, SUBSCRIPTIONS };