import { AsyncQueue } from '../src/AsyncQueue';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('AsyncQueue', () => {
  let queue: AsyncQueue;

  beforeEach(() => {
    queue = new AsyncQueue(2); // Concurrency limit of 2
  });

  it('should allow tasks within concurrency limit', async () => {
    await queue.wait();
    await queue.wait();
    expect(queue.remaining).toBe(0);
  });

  it('should queue tasks beyond concurrency limit', async () => {
    await queue.wait();
    await queue.wait();
    const task = queue.wait();
    expect(queue.queued).toBe(1);
    queue.shift();
    await task;
  });

  it('should abort all queued tasks', async () => {
    const abortController = {
      aborted: false,
      addEventListener(type: 'abort', listener: () => void) {
        this.listener = listener;
      },
      removeEventListener(type: 'abort', listener: () => void) {
        this.listener = undefined;
      },
      abort() {
        this.aborted = true;
        if (this.listener) this.listener();
      },
    };

    const task = queue.wait({ signal: abortController });
    abortController.abort();
    await expect(task).rejects.toThrow('Request aborted manually');
  });

  it('should clear the queue', () => {
    queue.wait();
    queue.clear();
    expect(queue.remaining).toBe(0);
  });

  it('should pause and resume the queue', async () => {
    queue.pause();
    const task = queue.wait();
    expect(queue.queued).toBe(1);
    queue.resume();
    queue.shift();
    await task;
  });

  it('should handle task dependencies', async () => {
    const dependency = Promise.resolve();
    const task = queue.wait({ dependencies: [dependency] });
    queue.shift();
    await task;
  });

  it('should track task metrics', async () => {
    await queue.wait();
    await queue.wait();
    expect(queue.metrics.activeTasks).toBe(2);
    expect(queue.metrics.queuedTasks).toBe(0);
  });

  it('should adjust concurrency dynamically', () => {
    queue.setConcurrency(3);
    expect(queue.metrics.activeTasks).toBe(0);
  });

  it('should prioritize high-priority tasks', async () => {
    const lowPriorityTask = queue.wait({ priority: 'low' });
    const highPriorityTask = queue.wait({ priority: 'high' });

    queue.shift(); // Process the first task
    await highPriorityTask; // High-priority task should complete first
    await lowPriorityTask; // Low-priority task should complete next
  });
});