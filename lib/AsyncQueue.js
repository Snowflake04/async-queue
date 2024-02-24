import { AsyncQueueEntry } from './AsyncQueueEntry';

export class AsyncQueue {
  constructor() {
    this.promises = [];
  }

  get remaining() {
    return this.promises.length;
  }
  get queued() {
    return this.remaining === 0 ? 0 : this.remaining - 1;
  }

  wait(options) {
    const entry = new AsyncQueueEntry(this);
    if (this.promises.length === 0) {
      this.promises.push(entry);
      return Promise.resolve();
    }
    this.promises.push(entry);
    if (options === null || options === void 0 ? void 0 : options.signal)
      entry.setSignal(options.signal);
    return entry.promise;
  }

  shift() {
    if (this.promises.length === 0) return;
    if (this.promises.length === 1) {
      // Remove the head entry.
      this.promises.shift();
      return;
    }

    this.promises.shift();
    this.promises[0].use();
  }

  abortAll() {
    if (this.queued === 0) return;

    for (let i = 1; i < this.promises.length; ++i) {
      this.promises[i].abort();
    }
    this.promises.length = 1;
  }
}
