import { AsyncQueue } from "../src/AsyncQueue";
import { TaskMetrics } from "../src/types";
import { red, green } from "yoctocolors";

// Example 1: Basic Usage of AsyncQueue
async function basicUsage() {
  return new Promise((resolve) => {
    const queue = new AsyncQueue(1);
    const tasks = [
      {
        priority: "normal",
        fn: () => console.log(green("normal priority task 1 completed")),
      },

      {
        priority: "low",
        fn: () => console.log(green("low priority task 1 completed")),
      },
      {
        priority: "high",
        fn: () => console.log(green("high priority task 1 completed")),
      },
      {
        priority: "low",
        fn: () => console.log(green("low priority task 2 completed")),
      },
      {
        priority: "normal",
        fn: () => console.log(green("normal priority task 2 completed")),
      },
      {
        priority: "high",
        fn: () => console.log(green("high priority task 2 completed")),
      },

      {
        priority: "normal",
        fn: () => console.log(green("normal priority task 3 completed")),
      },
      {
        priority: "low",
        fn: () => console.log(green("low priority task 3 completed")),
      },
      {
        priority: "high",
        fn: () => console.log(green("high priority task 3 completed")),
      },
    ];

    const addToQueue = async (task: any) => {
      await queue.wait({ priority: task.priority });
      task.fn();
    };

    // Add tasks to the queue
    tasks.forEach((task) => {
      addToQueue(task);
    });

    const i = setInterval(() => {
      if (queue.remaining === 0) {
        clearInterval(i);
        console.log("All tasks completed!");
        resolve(null);
      }
      queue.shift();
    }, 1000);
  });
}

// Example 2: Using EventEmitter for Task Lifecycle Events
async function eventEmitterUsage() {
  const queue = new AsyncQueue(1);
  // Listen to task lifecycle events
  queue.onQueued((task) => {
    console.log(`Task queued: Priority = ${task.priority}`);
  });

  queue.onStarted((task) => {
    console.log(`Task started: Priority = ${task.priority}`);
  });

  queue.onCompleted(() => {
    console.log(`All Tasks has been completed`);
  });

  queue.onFailed((task, error) => {
    console.error(`Task failed: ${error.message}`);
  });

  // Add tasks to the queue
  const task1 = queue.wait({ priority: "high" });
  const task2 = queue.wait({ priority: "normal" });
  const task3 = queue.wait({ priority: "low" });

  // Simulate task completion
  setTimeout(() => queue.shift(), 1000); // Complete task1 after 1 second
  setTimeout(() => queue.shift(), 3000); // Complete task2 after 3 seconds
  setTimeout(() => queue.shift(), 5000); // Complete task3 after 5 seconds

  await Promise.all([task1, task2, task3]);
}

// Example 3: Using Task Dependencies
async function taskDependenciesUsage() {
  const queue = new AsyncQueue(2);

  // Create a dependency task
  const dependencyTask = new Promise((resolve) => {
    setTimeout(() => {
      console.log("Dependency task completed!");
      resolve(null);
    }, 3000);
  });

  // Add a task with dependencies
  const task = queue.wait({ dependencies: [dependencyTask] });
  console.log("Task with dependency added to the queue");

  // Simulate task completion
  setTimeout(() => queue.shift(), 2000); // Complete task after 2 seconds

  await task;
  console.log("Task with dependency completed!");
}

// Example 4: Using Task Metrics
async function taskMetricsUsage() {
  const queue = new AsyncQueue(1);

  // Add tasks to the queue
  const task1 = queue.wait({ priority: "high" });
  const task2 = queue.wait({ priority: "normal" });

  // Simulate task completion
  setTimeout(() => queue.shift(), 1000); // Complete task1 after 1 second
  setTimeout(() => queue.shift(), 2000); // Complete task2 after 2 seconds

  await Promise.all([task1, task2]);

  // Get task metrics
  const metrics: TaskMetrics = queue.metrics;
  console.log("Task Metrics:", metrics);
}

// Example 5: Aborting Tasks
async function abortTaskUsage() {
  const queue = new AsyncQueue(1);

  // Create an AbortController
  const abortController = new AbortController();

  // Add a task with an abort signal
  const task = queue.wait({ signal: abortController.signal });
  const task2 = queue.wait({ signal: abortController.signal });

  // Abort the task after 500ms
  setTimeout(() => {
    abortController.abort();
    console.log("Task aborted!");
  }, 500);

  try {
    await Promise.all([task, task2]);
  } catch (error) {
    console.error("Task failed:", error.message); // Expected: "Request aborted manually"
  }
}

// // Example 6: Retrying Failed Tasks
// async function retryTaskUsage() {
//   const queue = new AsyncQueue(2);

//   // Add a task with retries
//   const task = queue.wait({ retries: 2, retryDelay: 500 });

//   // Simulate task failure and retries
//   setTimeout(() => {
//     queue.shift(); // Simulate task failure
//     console.log("Task failed, retrying...");
//   }, 1000);

//   setTimeout(() => {
//     queue.shift(); // Simulate task success after retry
//     console.log("Task succeeded after retry!");
//   }, 2000);

//   await task;
// }

// Example 7: Pausing and Resuming the Queue
async function pauseResumeUsage() {
  const queue = new AsyncQueue(1);

  // Pause the queue
  setTimeout(() => {
    queue.pause();
    console.log("Queue paused");
  }, 500);

  // Add tasks to the queue
  const task1 = queue.wait({ priority: "high" });
  const task2 = queue.wait({ priority: "normal" });

  queue.onStarted((task) => {
    console.log(`Task started: Priority = ${task.priority}`);
  });

  queue.onCompleted(() => {
    console.log(`All tasks completed after pause/resume!`);
  });

  // Resume the queue after 2 second
  setTimeout(() => {
    queue.resume();
    console.log("Queue resumed");
  }, 2000);

  // Simulate task completion
  setTimeout(() => queue.shift(), 5000); // Complete task1 after 5 seconds
  setTimeout(() => queue.shift(), 7000); // Complete task2 after 7 seconds

  await Promise.all([task1, task2]);
}

// Run all examples
(async () => {
    console.log(red("=== Basic Usage ==="));
    await basicUsage();

  console.log(red("\n=== EventEmitter Usage ==="));
  await eventEmitterUsage();

  console.log(red("\n=== Task Dependencies Usage ==="));
  await taskDependenciesUsage();

  console.log(red("\n=== Task Metrics Usage ==="));
  await taskMetricsUsage();

  console.log(red("\n=== Abort Task Usage ==="));
  await abortTaskUsage();

  // console.log(red("\n=== Retry Task Usage ==="));
  // await retryTaskUsage();

  console.log(red("\n=== Pause/Resume Usage ==="));
  await pauseResumeUsage();
})();
