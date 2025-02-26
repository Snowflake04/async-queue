# Async Queue

The `AsyncQueue` package is a robust and efficient asynchronous queue for managing concurrent tasks with support for concurrency control, task prioritization, event handling, and more. It is designed to be environment-agnostic, meaning it works in browsers, Node.js, Deno, and other JavaScript runtimes.

---

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
   - [Basic Usage](#basic-usage)
   - [Priority-Based Execution](#priority-based-execution)
   - [Task Timeouts](#task-timeouts)
   - [Task Dependencies](#task-dependencies)
   - [Pause/Resume Functionality](#pauseresume-functionality)
   - [Event Handling](#event-handling)
   - [Dynamic Concurrency](#dynamic-concurrency)
3. [Advanced Usage](#advanced-usage)
   - [Custom Event Handlers](#custom-event-handlers)
   - [Task Retries](#task-retries)
   - [Task Metrics](#task-metrics)
   - [Task Retries](#task-retries)
   - [Abort All Tasks](#abort-all-tasks)
4. [API Reference](#api-reference)
   - [AsyncQueue](#asyncqueue)
   - [AsyncQueueOptions](#asyncqueueoptions)
   - [EventEmitter](#eventemitter)
5. [Examples](#examples)
   - [Basic Example](#basic-example)
   - [Priority Example](#priority-example)
   - [Timeout Example](#timeout-example)
   - [Dependency Example](#dependency-example)
   - [Pause/Resume Example](#pauseresume-example)
   - [Event Handling Example](#event-handling-example)
6. [FAQs](#faqs)
7. [Contributing](#contributing)
8. [License](#license)

---

## Installation

To install the `AsyncQueue` package, use npm:

```bash
npm install @snowflake04/async-queue
```

---

## Getting Started

### Basic Usage

Create an `AsyncQueue` instance and add tasks to it. Tasks will execute concurrently up to the specified concurrency limit.

```typescript
import { AsyncQueue } from '@snowflake04/async-queue';

const queue = new AsyncQueue(2); // Concurrency limit of 2

async function runTask(id: number) {
  console.log(`Task ${id} started`);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
  console.log(`Task ${id} completed`);
  queue.shift(); // Signal task completion
}

queue.wait().then(() => runTask(1));
queue.wait().then(() => runTask(2));
queue.wait().then(() => runTask(3));
```

---

### Priority-Based Execution

Tasks can be assigned a priority (`high`, `normal`, `low`). Higher-priority tasks are executed first.

```typescript
queue.wait({ priority: 'high' }).then(() => runTask(1));
queue.wait({ priority: 'low' }).then(() => runTask(2));
queue.wait({ priority: 'normal' }).then(() => runTask(3));
```

---

### Task Timeouts

Tasks can be configured to time out if they take too long to start or complete.

```typescript
queue.wait({ timeout: 5000 }) // Timeout after 5 seconds
  .then(() => runTask(1))
  .catch((err) => console.error(err)); // Handle timeout error
```

---

### Task Dependencies

Tasks can depend on the completion of other tasks before they start.

```typescript
const dependency = Promise.resolve();
queue.wait({ dependencies: [dependency] }).then(() => runTask(1));
```

---

### Pause/Resume Functionality

The queue can be paused and resumed without losing queued tasks.

```typescript
queue.pause(); // Pause the queue
queue.wait().then(() => runTask(1)); // Task is queued but not started
queue.resume(); // Resume the queue
```

---

### Event Handling

The `AsyncQueue` emits events for task lifecycle events (`queued`, `started`, `completed`, `failed`).

```typescript
queue.onQueued((task) => {
  console.log('Task queued:', task.data);
});

queue.onStarted((task) => {
  console.log('Task started:', task.data);
});

queue.onCompleted(() => {
  console.log("All tasks has been completed");
});

queue.onFailed((task, error) => {
  console.error('Task failed:', task.data, error);
});
```

---

### Dynamic Concurrency

The concurrency limit can be adjusted at runtime.

```typescript
queue.setConcurrency(5); // Increase concurrency limit to 5
```

---

## Advanced Usage

### Custom Event Handlers

You can add custom event handlers for specific tasks.

```typescript
queue.onQueued((task) => {
  if (task.data?.type === 'critical') {
    console.log('Critical task queued:', task.data);
  }
});
```

---

### Task Metrics

You can track task metrics like active tasks, queued tasks, average wait time, and throughput.

```typescript
console.log('Active tasks:', queue.metrics.activeTasks);
console.log('Queued tasks:', queue.metrics.queuedTasks);
console.log('Average wait time:', queue.metrics.averageWaitTime);
console.log('Throughput:', queue.metrics.throughput);
```

---

### Task Retries

Tasks can be retried a specified number of times with a delay between retries.

```typescript
queue.wait({ retries: 3, retryDelay: 1000 }) // Retry 3 times with 1-second delay
  .then(() => runTask(1))
  .catch((err) => console.error('Task failed after retries:', err));
```

---

### Abort All Tasks

You can abort all queued tasks at once.

```typescript
queue.abortAll(); // Abort all queued tasks
```

---

## API Reference

### AsyncQueue

#### `new AsyncQueue(concurrency: number = Infinity)`
Creates a new `AsyncQueue` instance with the specified concurrency limit.

#### `queue.wait(options: AsyncQueueOptions): Promise<void>`
Adds a task to the queue. Returns a promise that resolves when the task starts.

#### `queue.shift(): void`
Signals the completion of the current task and starts the next task in the queue.

#### `queue.pause(): void`
Pauses the queue. Tasks will be queued but not started.

#### `queue.resume(): void`
Resumes the queue. Queued tasks will start processing.

#### `queue.abortAll(): void`
Aborts all queued tasks.

#### `queue.clear(): void`
Clears the queue and resets the active task count.

#### `queue.setConcurrency(concurrency: number): void`
Adjusts the concurrency limit at runtime.

#### `queue.onQueued(listener: (task: AsyncQueueEntry) => void): void`
Adds a listener for the `queued` event.

#### `queue.onStarted(listener: (task: AsyncQueueEntry) => void): void`
Adds a listener for the `started` event.

#### `queue.onCompleted(): void`
Adds a listener for the `completed` event.

#### `queue.onFailed(listener: (task: AsyncQueueEntry, error: Error) => void): void`
Adds a listener for the `failed` event.

---

## Examples

### Basic Example

```typescript
import { AsyncQueue } from '@snowflake04/async-queue';

const queue = new AsyncQueue(2);

async function runTask(id: number) {
  console.log(`Task ${id} started`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Task ${id} completed`);
  queue.shift();
}

queue.wait().then(() => runTask(1));
queue.wait().then(() => runTask(2));
queue.wait().then(() => runTask(3));
```

---

## FAQs

### Q: How do I handle task failures?
A: Use the `onFailed` event to handle task failures.

```typescript
queue.onFailed((task, error) => {
  console.error('Task failed:', task.data, error);
});
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.