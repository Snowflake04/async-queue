import { AsyncQueue } from "./AsyncQueue";
import { AsyncQueueOptions, Priority } from "./types";

export class AsyncQueueEntry<T = any> {
  public promise: Promise<void>;
  public resolve!: () => void;
  public reject!: (reason?: Error) => void;
  private signal: AbortSignal | null = null;
  private signalListener: (() => void) | null = null;
  private timeoutId: number | null = null;
  private startTime: number = Date.now();
  private retries: number = 0;
  public priority: Priority;

  constructor(
    private queue: AsyncQueue<T>,
    private options: AsyncQueueOptions = {}
  ) {
    this.priority = options.priority || "normal";
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    if (options.timeout) {
      this.timeoutId = setTimeout(() => {
        this.reject(new Error("Task timed out"));
      }, options.timeout) as unknown as number;
    }
  }

  get priorityWeight(): number {
    const weights = { high: 1, normal: 2, low: 3 }; // Lower number = higher priority
    return weights[this.priority];
  }

  setSignal(signal: AbortSignal): this {
    if (signal.aborted) {
      this.reject(new Error("Request aborted manually"));
      return this;
    }

    this.signal = signal;
    this.signalListener = () => {
      this.reject(new Error("Request aborted manually"));
    };
    this.signal.addEventListener("abort", this.signalListener);
    return this;
  }

  async waitForDependencies(): Promise<void> {
    if (this.options.dependencies) {
      await Promise.all(this.options.dependencies);
    }
  }

  use(): this {
    this.dispose();
    this.resolve();
    return this;
  }

  async retry(): Promise<void> {
    if (this.retries < (this.options.retries || 0)) {
      this.retries++;
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.retryDelay || 0)
      );
      this.queue.wait(this.options); // Re-add the task to the queue
    } else {
      this.reject(new Error("Task failed after retries"));
    }
  }

  abort(): this {
    this.dispose();
    this.reject(new Error("Request aborted manually"));
    return this;
  }

  dispose(): void {
    if (this.signal) {
      this.signal.removeEventListener("abort", this.signalListener!);
      this.signal = null;
      this.signalListener = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  get waitTime(): number {
    return Date.now() - this.startTime;
  }
}
