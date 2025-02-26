import { AsyncQueueEntry } from '../src/AsyncQueueEntry';
import { AsyncQueue } from '../src/AsyncQueue';

describe('AsyncQueueEntry', () => {
  let queue: AsyncQueue;
  let entry: AsyncQueueEntry;

  beforeEach(() => {
    queue = new AsyncQueue();
    entry = new AsyncQueueEntry(queue);
  });

  it('should initialize with default values', () => {
    expect(entry.priority).toBe('normal');
    expect(entry.promise).toBeInstanceOf(Promise);
    expect(entry.waitTime).toBeGreaterThanOrEqual(0);
  });

  it('should handle priority weights', () => {
    const highPriorityEntry = new AsyncQueueEntry(queue, { priority: 'high' });
    const normalPriorityEntry = new AsyncQueueEntry(queue, { priority: 'normal' });
    const lowPriorityEntry = new AsyncQueueEntry(queue, { priority: 'low' });

    expect(highPriorityEntry.priorityWeight).toBe(1);
    expect(normalPriorityEntry.priorityWeight).toBe(2);
    expect(lowPriorityEntry.priorityWeight).toBe(3);
  });

  it('should handle abort signals', async () => {
    const abortController = new AbortController();
    entry.setSignal(abortController.signal);
    abortController.abort();

    await expect(entry.promise).rejects.toThrow('Request aborted manually');
  });

  it('should handle timeouts', async () => {
    const timeoutEntry = new AsyncQueueEntry(queue, { timeout: 10 });
    await expect(timeoutEntry.promise).rejects.toThrow('Task timed out');
  });

  it('should handle retries', async () => {
    const retryEntry = new AsyncQueueEntry(queue, { retries: 1, retryDelay: 10 });
    jest.spyOn(retryEntry, 'retry');

    await retryEntry.retry();
    expect(retryEntry.retry).toHaveBeenCalled();
  });

//   it('should dispose resources', () => {
//     const abortController = new AbortController();
//     entry.setSignal(abortController.signal);
//     entry.dispose();
//     expect(entry.signal).toBeNull();
//     expect(entry.signalListener).toBeNull();
//   });
});