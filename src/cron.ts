import type { ScheduledTask as NodeCronJob } from 'node-cron';
import { EventEmitter } from 'events'


interface CronJobConfig {
    cronTime: string;
    onTick: () => void;
}

export class CronJob extends EventEmitter implements NodeCronJob {
    [EventEmitter.captureRejectionSymbol]?<K>(error: Error, event: string | symbol, ...args: any[]): void {
        throw new Error('Method not implemented.');
    }

    constructor(args: CronJobConfig) {
        super()
    }

    addListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    on<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    once<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    removeListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    off<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    removeAllListeners(event?: string | symbol | undefined): this {
        throw new Error('Method not implemented.');
    }
    setMaxListeners(n: number): this {
        throw new Error('Method not implemented.');
    }
    getMaxListeners(): number {
        throw new Error('Method not implemented.');
    }
    listeners<K>(eventName: string | symbol): Function[] {
        throw new Error('Method not implemented.');
    }
    rawListeners<K>(eventName: string | symbol): Function[] {
        throw new Error('Method not implemented.');
    }
    emit<K>(eventName: string | symbol, ...args: any[]): boolean {
        throw new Error('Method not implemented.');
    }
    listenerCount<K>(eventName: string | symbol, listener?: Function | undefined): number {
        throw new Error('Method not implemented.');
    }
    prependListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    prependOnceListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    eventNames(): (string | symbol)[] {
        throw new Error('Method not implemented.');
    }
    now() { }
    start() { }
    stop() { }


}


export class GraphQLCron {
    private jobs: Map<string, CronJob>;

    constructor(uri: string) {

        this.jobs = new Map();
    }

    public async createJob(id: string, config: CronJobConfig) {
        if (this.jobs.has(id)) {
            throw new Error(`Job with ID ${id} already exists.`);
        }

        const job = new CronJob(config);
        this.jobs.set(id, job);
        job.start();
        return true;
    }

    public async stopJob(id: string) {
        const job = this.jobs.get(id);
        if (job) {
            job.stop();
            this.jobs.delete(id);
            return true;
        }
        return false;
    }

    public async getJobs() {
        return Array.from(this.jobs.keys());
    }
}

export default GraphQLCron;