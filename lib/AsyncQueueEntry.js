
export class AsyncQueueEntry {
  constructor(queue) {
    this.signal = null;
    this.signalListener = null;
    this.queue = queue;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  setSignal(signal) {
    if (signal.aborted) return this;
    this.signal = signal;
    this.signalListener = () => {
      const index = this.queue['promises'].indexOf(this);
      if (index !== -1) this.queue['promises'].splice(index, 1);
      this.reject(new Error('Request aborted manually'));
    };
    this.signal.addEventListener('abort', this.signalListener);
    return this;
  }
  use() {
    this.dispose();
    this.resolve();
    return this;
  }
  abort() {
    this.dispose();
    this.reject(new Error('Request aborted manually'));
    return this;
  }
  dispose() {
    if (this.signal) {
      this.signal.removeEventListener('abort', this.signalListener);
      this.signal = null;
      this.signalListener = null;
    }
  }
}
