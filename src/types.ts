export type Priority = 'high' | 'normal' | 'low';

export interface AbortSignalLike {
  readonly aborted: boolean;
  addEventListener(type: 'abort', listener: () => void): void;
  removeEventListener(type: 'abort', listener: () => void): void;
}

export interface AsyncQueueOptions {
  priority?: Priority; // Add priority option
  signal?: AbortSignalLike;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  dependencies?: Promise<any>[]; // Tasks that must complete before this one starts
}

export interface AsyncQueueEntry {
  id: string;
  priority: Priority;
  execute: () => Promise<void>;
}

export interface AsyncQueueEvents {
  queued: (task: AsyncQueueEntry) => void;
  started: (task: AsyncQueueEntry) => void;
  completed: (task: AsyncQueueEntry) => void;
  failed: (task: AsyncQueueEntry, error: Error) => void;
}

export interface TaskMetrics {
  activeTasks: number;
  queuedTasks: number;
  averageWaitTime: number;
  throughput: number; // Tasks completed per second
}