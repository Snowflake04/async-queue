import { AsyncQueue } from '../src/AsyncQueue';

describe('AsyncQueue', () => {
  let queue: AsyncQueue;

  beforeEach(() => {
    queue = new AsyncQueue(2); // Set concurrency to 2 for testing
  });

  it('should initialize with default values', () => {
    expect(queue.remaining).toBe(0);
    expect(queue.queued).toBe(0);
    expect(queue.metrics).toEqual({
      activeTasks: 0,
      queuedTasks: 0,
      averageWaitTime: 0,
      throughput: 0,
    });
  });

  it('should add tasks to the queue', async () => {
    const task = queue.wait();
    expect(queue.remaining).toBe(1);
    expect(queue.queued).toBe(0);

    queue.shift();
    await task;
    expect(queue.remaining).toBe(0);
  });

  it('should respect concurrency limit', async () => {
    const task1 = queue.wait();
    const task2 = queue.wait();
    const task3 = queue.wait();

    expect(queue.remaining).toBe(3);
    expect(queue.queued).toBe(1);

    queue.shift();
    await task1;
    expect(queue.remaining).toBe(2);
    expect(queue.queued).toBe(0);

    queue.shift();
    await task2;
    expect(queue.remaining).toBe(1);
    expect(queue.queued).toBe(0);

    queue.shift();
    await task3;
    expect(queue.remaining).toBe(0);
  });

  it('should handle task priorities', async () => {
    const highPriorityTask = queue.wait({ priority: 'high' });
    const normalPriorityTask = queue.wait({ priority: 'normal' });
    const lowPriorityTask = queue.wait({ priority: 'low' });

    expect(queue.remaining).toBe(3);
    expect(queue.queued).toBe(1);

    queue.shift();
    await highPriorityTask;
    expect(queue.remaining).toBe(2);

    queue.shift();
    await normalPriorityTask;
    expect(queue.remaining).toBe(1);

    queue.shift();
    await lowPriorityTask;
    expect(queue.remaining).toBe(0);
  });

  it('should pause and resume the queue', async () => {
    queue.pause();
    const task = queue.wait();
    expect(queue.remaining).toBe(1);
    expect(queue.queued).toBe(0);

    queue.resume();
    queue.shift();
    await task;
    expect(queue.remaining).toBe(0);
  });

  it('should abort all tasks', async () => {
    const task1 = queue.wait();
    const task2 = queue.wait();
    const task3 = queue.wait();

    queue.abortAll();
    expect(queue.remaining).toBe(0);
    expect(queue.queued).toBe(0);

    await expect(task1).rejects.toThrow('Request aborted manually');
    await expect(task2).rejects.toThrow('Request aborted manually');
    await expect(task3).rejects.toThrow('Request aborted manually');
  });

  it('should clear the queue', () => {
    queue.wait();
    queue.wait();
    queue.clear();
    expect(queue.remaining).toBe(0);
    expect(queue.queued).toBe(0);
  });

  it('should update concurrency', async () => {
    queue.setConcurrency(1);
    const task1 = queue.wait();
    const task2 = queue.wait();

    expect(queue.remaining).toBe(2);
    expect(queue.queued).toBe(1);

    queue.shift();
    await task1;
    expect(queue.remaining).toBe(1);
    expect(queue.queued).toBe(0);

    queue.setConcurrency(2);
    queue.shift();
    await task2;
    expect(queue.remaining).toBe(0);
  });

  it('should emit events', async () => {
    const queuedListener = jest.fn();
    const startedListener = jest.fn();
    const completedListener = jest.fn();

    queue.onQueued(queuedListener);
    queue.onStarted(startedListener);
    queue.onCompleted(completedListener);

    const task = queue.wait();
    expect(queuedListener).toHaveBeenCalled();

    queue.shift();
    await task;
    expect(startedListener).toHaveBeenCalled();
    expect(completedListener).toHaveBeenCalled();
  });

  it('should calculate metrics', async () => {
    const task1 = queue.wait();
    const task2 = queue.wait();

    queue.shift();
    await task1;
    queue.shift();
    await task2;

    const metrics = queue.metrics;
    expect(metrics.activeTasks).toBe(0);
    expect(metrics.queuedTasks).toBe(0);
    expect(metrics.averageWaitTime).toBeGreaterThan(0);
    expect(metrics.throughput).toBeGreaterThan(0);
  });
});