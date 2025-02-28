// Web Worker implementation for CPU-intensive tasks
class CronWorker {
  constructor() {
    self.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent): void {
    const { type, data, jobId } = event.data;
    
    switch (type) {
      case 'EXECUTE_TASK':
        this.executeTask(data, jobId);
        break;
      case 'VALIDATE_CRON':
        this.validateCron(data.expression, jobId);
        break;
      default:
        self.postMessage({
          error: `Unknown message type: ${type}`,
          jobId
        });
    }
  }

  private async executeTask(taskData: any, jobId: string): Promise<void> {
    try {
      // Use a try-catch to handle any errors in the task
      const result = await this.processTask(taskData);
      
      // Send the result back to the main thread
      self.postMessage({
        type: 'TASK_COMPLETED',
        jobId,
        result
      });
    } catch (error) {
      self.postMessage({
        type: 'TASK_FAILED',
        jobId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async processTask(taskData: any): Promise<any> {
    const { taskType, payload } = taskData;
    
    // Handle different task types
    switch (taskType) {
      case 'COMPUTATION':
        return this.performComputation(payload);
      case 'DATA_PROCESSING':
        return this.processData(payload);
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  private async performComputation(payload: any): Promise<any> {
    // Example of a CPU-intensive computation
    const { operation, values } = payload;
    
    switch (operation) {
      case 'SORT':
        return [...values].sort((a, b) => a - b);
      case 'FILTER':
        const { predicate } = payload;
        return values.filter((v: any) => eval(predicate)(v));
      case 'MAP':
        const { transform } = payload;
        return values.map((v: any) => eval(transform)(v));
      default:
        throw new Error(`Unknown computation operation: ${operation}`);
    }
  }

  private async processData(payload: any): Promise<any> {
    // Example of data processing
    const { data, operations } = payload;
    
    let result = data;
    
    for (const op of operations) {
      switch (op.type) {
        case 'FILTER':
          result = result.filter((item: any) => {
            for (const [key, value] of Object.entries(op.criteria)) {
              if (item[key] !== value) {
                return false;
              }
            }
            return true;
          });
          break;
        case 'MAP':
          result = result.map((item: any) => {
            const newItem: any = {};
            for (const [newKey, origKey] of Object.entries(op.mapping)) {
              newItem[newKey] = item[origKey as string];
            }
            return newItem;
          });
          break;
        case 'AGGREGATE':
          const groupBy = op.groupBy;
          const groups: Record<string, any[]> = {};
          
          for (const item of result) {
            const key = item[groupBy];
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(item);
          }
          
          result = Object.entries(groups).map(([key, group]) => {
            const aggregated: Record<string, any> = { [groupBy]: key };
            
            for (const [field, method] of Object.entries(op.aggregations)) {
              switch (method) {
                case 'SUM':
                  aggregated[field] = group.reduce((sum, item) => sum + item[field], 0);
                  break;
                case 'AVG':
                  aggregated[field] = group.reduce((sum, item) => sum + item[field], 0) / group.length;
                  break;
                case 'COUNT':
                  aggregated[field] = group.length;
                  break;
                case 'MIN':
                  aggregated[field] = Math.min(...group.map(item => item[field]));
                  break;
                case 'MAX':
                  aggregated[field] = Math.max(...group.map(item => item[field]));
                  break;
              }
            }
            
            return aggregated;
          });
          break;
      }
    }
    
    return result;
  }

  private validateCron(expression: string, jobId: string): void {
    try {
      // Simple validation of cron expression
      const parts = expression.split(' ');
      
      if (parts.length < 5 || parts.length > 6) {
        throw new Error('Cron expression must have 5 or 6 parts');
      }
      
      // Very basic validation of each part
      const [minute, hour, dayOfMonth, month, dayOfWeek, year] = parts;
      
      // Check if the parts are in valid ranges or contain valid special characters
      const validatePart = (part: string, min: number, max: number): boolean => {
        if (part === '*') return true;
        
        const ranges = part.split(',');
        for (const range of ranges) {
          if (range.includes('/')) {
            // Step value
            const [value, step] = range.split('/');
            if (value !== '*' && (isNaN(Number(value)) || Number(value) < min || Number(value) > max)) {
              return false;
            }
            if (isNaN(Number(step)) || Number(step) <= 0) {
              return false;
            }
          } else if (range.includes('-')) {
            // Range
            const [start, end] = range.split('-');
            if (isNaN(Number(start)) || isNaN(Number(end)) || 
                Number(start) < min || Number(start) > max ||
                Number(end) < min || Number(end) > max ||
                Number(start) > Number(end)) {
              return false;
            }
          } else {
            // Single value
            if (isNaN(Number(range)) || Number(range) < min || Number(range) > max) {
              return false;
            }
          }
        }
        
        return true;
      };
      
      const isValid =
        validatePart(minute, 0, 59) &&
        validatePart(hour, 0, 23) &&
        validatePart(dayOfMonth, 1, 31) &&
        validatePart(month, 1, 12) &&
        validatePart(dayOfWeek, 0, 6) &&
        (year === undefined || validatePart(year, 1970, 2099));
      
      self.postMessage({
        type: 'CRON_VALIDATION',
        jobId,
        isValid
      });
    } catch (error) {
      self.postMessage({
        type: 'CRON_VALIDATION',
        jobId,
        isValid: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

// Initialize the worker
new CronWorker();