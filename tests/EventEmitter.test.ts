import { EventEmitter } from '../src/events';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  it('should add and remove listeners', () => {
    const listener = jest.fn();
    emitter.on('test', listener);
    emitter.emit('test');
    expect(listener).toHaveBeenCalled();

    emitter.off('test', listener);
    emitter.emit('test');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should handle once listeners', () => {
    const listener = jest.fn();
    emitter.once('test', listener);
    emitter.emit('test');
    emitter.emit('test');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should remove all listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    emitter.on('test', listener1);
    emitter.on('test', listener2);
    emitter.removeAllListeners('test');
    emitter.emit('test');
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });
});