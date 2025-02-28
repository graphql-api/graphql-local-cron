export class BroadcastService {
  private channel: BroadcastChannel;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private origin: string;

  constructor(channelName: string) {
    this.channel = new BroadcastChannel(channelName);
    this.origin = window.location.origin;
    
    // Set up message listener
    this.channel.onmessage = (event) => {
      this.handleMessage(event);
    };
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data, source, origin } = event.data;
    
    // Validate origin to prevent cross-origin attacks
    if (origin && origin !== this.origin) {
      console.warn('Received message from untrusted origin:', origin);
      return;
    }
    
    // Ignore messages from self
    if (source === this.getInstanceId()) {
      return;
    }
    
    // Notify subscribers
    const subscribers = this.subscribers.get(type);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in broadcast subscriber:', error);
        }
      });
    }
  }

  // Generate a unique instance ID
  private getInstanceId(): string {
    if (!this._instanceId) {
      this._instanceId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    return this._instanceId;
  }
  private _instanceId: string | null = null;

  public publish(type: string, data: any): void {
    this.channel.postMessage({
      type,
      data,
      source: this.getInstanceId(),
      origin: this.origin,
      timestamp: Date.now()
    });
  }

  public subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    
    this.subscribers.get(type)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(type);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(type);
        }
      }
    };
  }

  public close(): void {
    this.channel.close();
    this.subscribers.clear();
  }
}

export class TaskRegistry {
  private tasks: Map<string, (payload: any, context: any) => Promise<any>> = new Map();

  public registerTask(type: string, handler: (payload: any, context: any) => Promise<any>): void {
    this.tasks.set(type, handler);
  }

  public getTaskHandler(type: string): ((payload: any, context: any) => Promise<any>) | undefined {
    return this.tasks.get(type);
  }

  public hasTaskHandler(type: string): boolean {
    return this.tasks.has(type);
  }

  public getAllTaskTypes(): string[] {
    return Array.from(this.tasks.keys());
  }
}