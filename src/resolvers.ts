import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { CronScheduler } from './scheduler/scheduler';
import { 
  JobStatus,
  CronJobInput,
  Resolvers
} from './types';

// Helper function to format dates consistently
const formatDate = (date: Date): string => date.toISOString();

// Scalar definitions
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return formatDate(value);
    }
    return value;
  },
  parseValue(value) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
});

const CronScalar = new GraphQLScalarType({
  name: 'Cron',
  description: 'Cron expression scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    if (typeof value === 'string') {
      return value;
    }
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  }
});

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT: {
        const value = Object.create(null);
        ast.fields.forEach(field => {
          value[field.name.value] = parseLiteral(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return ast.values.map(parseLiteral);
      default:
        return null;
    }
  }
});

function parseLiteral(ast: any): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = Object.create(null);
      ast.fields.forEach((field: any) => {
        value[field.name.value] = parseLiteral(field.value);
      });
      return value;
    }
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    default:
      return null;
  }
}

export function createResolvers(scheduler: CronScheduler): Resolvers {
  return {
    DateTime: DateTimeScalar,
    Cron: CronScalar,
    JSON: JSONScalar,
    
    Query: {
      jobs: async () => {
        return scheduler.getJobs();
      },
      job: async (_, { id }) => {
        return scheduler.getJob(id);
      },
      jobsByTag: async (_, { tag }) => {
        return scheduler.getJobsByTag(tag);
      },
      jobsByStatus: async (_, { status }) => {
        return scheduler.getJobsByStatus(status);
      }
    },
    
    Mutation: {
      createJob: async (_, { input }) => {
        return scheduler.createJob(input);
      },
      updateJob: async (_, { id, input }) => {
        const updatedJob = await scheduler.updateJob(id, input);
        if (!updatedJob) {
          throw new Error(`Job with ID ${id} not found`);
        }
        return updatedJob;
      },
      deleteJob: async (_, { id }) => {
        return scheduler.deleteJob(id);
      },
      pauseJob: async (_, { id }) => {
        const job = await scheduler.pauseJob(id);
        if (!job) {
          throw new Error(`Job with ID ${id} not found`);
        }
        return job;
      },
      resumeJob: async (_, { id }) => {
        const job = await scheduler.resumeJob(id);
        if (!job) {
          throw new Error(`Job with ID ${id} not found`);
        }
        return job;
      },
      triggerJobNow: async (_, { id }) => {
        const job = await scheduler.triggerJobNow(id);
        if (!job) {
          throw new Error(`Job with ID ${id} not found`);
        }
        return job;
      }
    },
    
    Subscription: {
      jobStatusChanged: {
        subscribe: () => scheduler.subscribeToJobStatusChanges()
      },
      jobCompleted: {
        subscribe: () => scheduler.subscribeToJobCompletions()
      },
      jobFailed: {
        subscribe: () => scheduler.subscribeToJobFailures()
      }
    }
  };
}