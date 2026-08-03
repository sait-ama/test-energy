export type EventListener<T> = (data: T) => void;

export class EventEmitter<EventMap extends Record<string, unknown>> {
  private listeners: { [K in keyof EventMap]?: Set<EventListener<EventMap[K]>> } = {};

  public on<K extends keyof EventMap>(event: K, listener: EventListener<EventMap[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event]!.add(listener);

    return () => {
      this.off(event, listener);
    };
  }

  public off<K extends keyof EventMap>(event: K, listener: EventListener<EventMap[K]>): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event]!.delete(listener);
  }

  public emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event]!.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error);
        console.error('Event data:', JSON.stringify(data, null, 2));
      }
    });
  }

  public once<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>
  ): () => void {
    const onceListener: EventListener<EventMap[K]> = (data) => {
      this.off(event, onceListener);
      listener(data);
    };

    return this.on(event, onceListener);
  }

  public removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}
