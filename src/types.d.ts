export interface CronJob<ID extends string = string> {
    id: string;
    cronTime: string;
}

export interface Query<ID extends string = string> {
    jobs: CronJob<ID>[];
}

export interface Mutation<ID extends string = string> {
    createJob(id: ID, cronTime: string): boolean;
    stopJob(id: ID): boolean;
}