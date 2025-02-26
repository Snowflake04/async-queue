type Listener<T = any> = (...args: any) => void;

export class EventEmitter {
  private listeners: Record<string, Listener[]> = {};

  on<T = any>(event: string, listener: Listener<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off<T = any>(event: string, listener: Listener<T>): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
  }

  emit<T = any>(event: string, data?: T): void {
    if (this.listeners[event]) {
      for (const listener of this.listeners[event]) {
        listener(data);
      }
    }
  }

  once<T = any>(event: string, listener: Listener<T>): void {
    const onceListener: Listener<T> = (data) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}