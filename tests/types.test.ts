import { AsyncQueueOptions, Priority, TaskMetrics, AbortSignalLike } from '../src/types';

describe('Type Definitions', () => {
  it('should define AsyncQueueOptions', () => {
    const options: AsyncQueueOptions = {
      priority: 'high',
      signal: {
        aborted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      timeout: 1000,
      retries: 3,
      retryDelay: 100,
      dependencies: [Promise.resolve()],
    };

    expect(options.priority).toBe('high');
    expect(options.signal).toBeDefined();
    expect(options.timeout).toBe(1000);
    expect(options.retries).toBe(3);
    expect(options.retryDelay).toBe(100);
    expect(options.dependencies).toBeDefined();
  });

  it('should define TaskMetrics', () => {
    const metrics: TaskMetrics = {
      activeTasks: 1,
      queuedTasks: 2,
      averageWaitTime: 3.5,
      throughput: 4.2,
    };

    expect(metrics.activeTasks).toBe(1);
    expect(metrics.queuedTasks).toBe(2);
    expect(metrics.averageWaitTime).toBe(3.5);
    expect(metrics.throughput).toBe(4.2);
  });

  it('should define AbortSignalLike', () => {
    const signal: AbortSignalLike = {
      aborted: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    expect(signal.aborted).toBe(false);
    expect(signal.addEventListener).toBeDefined();
    expect(signal.removeEventListener).toBeDefined();
  });
});