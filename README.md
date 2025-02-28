# GraphQL Local Cron

A powerful browser-based GraphQL cron job management system that utilizes modern web APIs to provide robust scheduling, persistence, and job management across browser tabs and offline scenarios.

## Features

- **GraphQL API** for job management and monitoring
- **IndexedDB Storage** for persistent storage between sessions
- **Cross-Tab Communication** via BroadcastChannel API
- **Background Processing** with ServiceWorker
- **Offline Support** using Background Sync API
- **Web Push Notifications** for job events
- **Resource Management** with RequestIdleCallback and Web Workers
- **Comprehensive Error Handling** with retry mechanisms
- **Full TypeScript Support** with robust type definitions

## Installation

```bash
npm install @graphql-local/cron
```

## Quick Start

```javascript
import { GraphQLCron, JobStatus } from '@graphql-local/cron';

// Initialize the cron system
const cron = new GraphQLCron({
  storagePrefix: 'my-app',
  maxConcurrentJobs: 3,
  enableNotifications: true
});

// Register task handlers
cron.registerTaskHandler('EMAIL', async (payload, context) => {
  try {
    // Send email using payload data
    await sendEmail(payload.data.recipient, payload.data.subject, payload.data.body);
    
    return {
      success: true,
      data: { sent: true, timestamp: new Date() }
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
await cron.createJob({
  name: 'Daily Report Email',
  schedule: '0 9 * * *', // Run at 9am daily
  task: {
    type: 'EMAIL',
    data: {
      recipient: 'user@example.com',
      subject: 'Daily Report',
      body: 'Here is your daily report...'
    }
  },
  maxRetries: 3,
  tags: ['email', 'report']
});

// Get all jobs
const jobs = await cron.getJobs();

// Get jobs by tag
const emailJobs = await cron.getJobsByTag('email');

// Get jobs by status
const failedJobs = await cron.getJobsByStatus(JobStatus.FAILED);
```

## GraphQL Integration

### Apollo Client Integration

```javascript
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphQLCron } from '@graphql-local/cron';
import { QUERIES, MUTATIONS } from '@graphql-local/cron/client';

// Initialize the cron system
const cron = new GraphQLCron();

// Create Apollo Client
const client = new ApolloClient({
  cache: new InMemoryCache(),
  typeDefs: cron.getSchema(),
  resolvers: cron.getResolvers()
});

// Use GraphQL operations
const { data } = await client.query({
  query: QUERIES.GET_JOBS
});

await client.mutate({
  mutation: MUTATIONS.CREATE_JOB,
  variables: {
    input: {
      name: 'Data Sync',
      schedule: '*/15 * * * *',
      task: {
        type: 'SYNC',
        data: { endpoint: '/api/sync' }
      }
    }
  }
});
```

## Task Types and Handlers

You can register handlers for different types of tasks:

```javascript
// Register a data sync task handler
cron.registerTaskHandler('SYNC', async (payload, context) => {
  try {
    const response = await fetch(payload.data.endpoint);
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

// Register a notification task handler
cron.registerTaskHandler('NOTIFICATION', async (payload, context) => {
  try {
    if (Notification.permission === 'granted') {
      const notification = new Notification(payload.data.title, {
        body: payload.data.body,
        icon: payload.data.icon
      });
      
      return {
        success: true,
        data: { shown: true }
      };
    }
    
    return {
      success: false,
      error: new Error('Notification permission not granted')
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
});
```

## Configuration Options

The `GraphQLCron` constructor accepts the following configuration options:

```javascript
const cron = new GraphQLCron({
  // Storage configuration
  storagePrefix: 'my-app', // Prefix for IndexedDB database
  
  // Communication
  broadcastChannelName: 'my-app-cron-events', // Name for BroadcastChannel
  
  // Job execution
  maxConcurrentJobs: 5, // Maximum number of jobs running concurrently
  defaultMaxRetries: 3, // Default retry count for failed jobs
  jobExpirationDays: 30, // Number of days to keep completed/failed jobs
  
  // Notifications
  enableNotifications: true, // Enable web push notifications
  
  // Rate limits
  rateLimits: {
    createJob: 60, // Maximum jobs created per minute
    triggerJob: 30 // Maximum jobs triggered manually per minute
  }
});
```

## Browser Compatibility

This library requires modern browser APIs and is compatible with:

- Chrome/Edge 80+
- Firefox 79+
- Safari 15.4+

The following browser APIs are utilized:
- IndexedDB
- BroadcastChannel
- ServiceWorker
- Web Workers
- Background Sync API
- Page Visibility API
- Notifications API
- RequestIdleCallback

## License

MIT