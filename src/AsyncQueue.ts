import { AsyncQueueEntry } from "./AsyncQueueEntry";
import { AsyncQueueOptions, TaskMetrics } from "./types";
import { EventEmitter } from "./events";

export class AsyncQueue<T = any> {
  private queue: AsyncQueueEntry<T>[] = [];
  private activeCount: number = 0;
  private concurrency: number;
  private isPaused: boolean = false;
  private events = new EventEmitter();
  private totalWaitTime: number = 0;
  private completedTasks: number = 0;
  private lastProcessedTime: number = Date.now();

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  get remaining(): number {
    return this.queue.length;
  }

  get queued(): number {
    return this.remaining === 0 ? 0 : this.remaining - 1;
  }

  get metrics(): TaskMetrics {
    const now = Date.now();
    const elapsedTime = (now - this.lastProcessedTime) / 1000; // In seconds
    const throughput = elapsedTime > 0 ? this.completedTasks / elapsedTime : 0;

    return {
      activeTasks: this.activeCount,
      queuedTasks: this.queued,
      averageWaitTime:
        this.completedTasks > 0 ? this.totalWaitTime / this.completedTasks : 0,
      throughput,
    };
  }

  onQueued(listener: (task: AsyncQueueEntry<T>) => void): void {
    this.events.on("queued", listener);
  }

  onStarted(listener: (task: AsyncQueueEntry<T>) => void): void {
    this.events.on("started", listener);
  }

  onCompleted(listener: (task: AsyncQueueEntry<T>) => void): void {
    this.events.on("completed", listener);
  }

  onFailed(listener: (task: AsyncQueueEntry<T>, error: Error) => void): void {
    this.events.on("failed", listener);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.processQueue();
  }

  async wait(options: AsyncQueueOptions = {}): Promise<void> {
    const entry = new AsyncQueueEntry<T>(this, options);

    if (this.activeCount < this.concurrency && !this.isPaused) {
      this.activeCount++;
      await entry.waitForDependencies();
      this.events.emit("started", entry);
      return;
    }

    // Add the task to the queue and sort by priority
    this.queue.push(entry);
    this.queue.sort((a, b) => a.priorityWeight - b.priorityWeight); // Sort by priority
    this.events.emit("queued", entry);

    if (options.signal) {
      entry.setSignal(options.signal);
    }
    await entry.promise;
  }

  shift(): void {
    this.activeCount--;
    this.completedTasks++;
    this.totalWaitTime += this.queue[0]?.waitTime || 0;
    this.lastProcessedTime = Date.now();

    if (this.queue.length === 0) {
      this.events.emit("completed", null);
      return;
    }

    if (this.queue.length > 0 && !this.isPaused) {
      const nextEntry = this.queue.shift()!;
      this.activeCount++;
      nextEntry.use();
      this.events.emit("started", nextEntry);
    }
  }

  abortAll(): void {
    for (const entry of this.queue) {
      entry.abort();
    }
    this.queue = [];
  }

  clear(): void {
    this.queue = [];
    this.activeCount = 0;
  }

  setConcurrency(concurrency: number): void {
    this.concurrency = concurrency;
    this.processQueue();
  }

  private processQueue(): void {
    while (
      this.activeCount < this.concurrency &&
      this.queue.length > 0 &&
      !this.isPaused
    ) {
      const nextEntry = this.queue.shift()!;
      this.activeCount++;
      nextEntry.use();
      this.events.emit("started", nextEntry);
    }
  }
}
