import { captureException } from '@sentry/nextjs';
import Deque from 'denque';

import { TRANSPARENT_EMPTY_IMAGE_PLACEHOLDER } from '~shared/assets/placeholders/empty-image';
import { logger } from '~shared/lib/logger';
import { createAbortError, isAbortError } from '~shared/utils/abort-error';
import { promiseWithResolvers } from '~shared/utils/promiseWithResolvers';
import { range } from '~shared/utils/range';

class ImageOptimizedLoaderError {
  public message: string;

  constructor(opts: { key: string; src: string; status?: string | number; info?: string }) {
    this.message =
      `ImageOptimizedLoaderError: error while loading image \n` +
      `{ key: ${opts.key}, src: ${opts.src} } \n` +
      (opts.status ? `Status: ${opts.status} \n` : '') +
      (opts.info ? `Info: ${opts.info}` : '');
  }
}

export enum ImageOptimizedLoaderStateStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  ERROR = 'error',
  IDLE = 'idle',
}
export type ImageOptimizedLoaderStateItem<Key> = {
  image: HTMLImageElement;
  key: Key;
  retry?: (queue: ImageOptimizedLoaderQueueName) => void;
  abort?: () => void;
  status: ImageOptimizedLoaderStateStatus;
};
export type ImageOptimizedLoaderState<Key> = Map<string, ImageOptimizedLoaderStateItem<Key>>;

export type ImageOptimizedLoaderMemoizedState<Key> = Map<
  string,
  ImageOptimizedLoaderStateItem<Key> | null
>;

type ImageTaskSchema<Origin extends string | number> = {
  key: string;
  images: Record<
    Origin,
    {
      src: string;
      // origin: string;
    }
  >;
};

type ImageTasksQueueTask = { fn: () => Promise<unknown>; key: string };

// !READERDEBUG
// const dispatchImageTasksQueueDebugEvent = (values: string[]) => {
//   const event = new CustomEvent('readerQueueChange', {
//     detail: {
//       values: JSON.stringify(values),
//     },
//     bubbles: true,
//     cancelable: true,
//   });
//   window.dispatchEvent(event);
// };

export class ImageTasksQueue {
  private queue: Deque<ImageTasksQueueTask>;
  private running = 0;
  private readonly concurrency: number;
  private readonly onTaskComplete?: () => void;

  constructor(opts: { concurrency: number; onTaskComplete?: () => void }) {
    this.concurrency = opts.concurrency;
    this.onTaskComplete = opts.onTaskComplete;

    this.queue = new Deque<ImageTasksQueueTask>();
  }

  public enqueue(task: ImageTasksQueueTask, prioritize = false) {
    if (prioritize) {
      this.queue.unshift(task);
    } else {
      this.queue.push(task);
    }

    // !READERDEBUG
    // dispatchImageTasksQueueDebugEvent(this.queue.toArray().map((it) => it.key));

    this.processNext();
  }

  private processNext() {
    while (this.canProcessAmount > 0 && this.queue.length > 0) {
      this.processSingle();
    }
  }

  private async processSingle() {
    const task = this.queue.shift();

    // !READERDEBUG
    // dispatchImageTasksQueueDebugEvent(this.queue.toArray().map((it) => it.key));

    if (!task) {
      this.onTaskComplete?.();
      return;
    }

    this.running++;
    await task.fn().catch(() => {});

    this.running--;

    this.onTaskComplete?.();
    this.processNext();
  }

  public remove(predicate: (key: ImageTasksQueueTask['key']) => boolean) {
    const requestsOutsidePredicate: ImageTasksQueueTask[] = [];
    const requestsInsidePredicate: ImageTasksQueueTask[] = [];

    this.queue.toArray().forEach((it) => {
      if (predicate(it.key)) {
        requestsInsidePredicate.push(it);
      } else {
        requestsOutsidePredicate.push(it);
      }
    });

    this.queue = new Deque<ImageTasksQueueTask>(requestsOutsidePredicate);

    return requestsInsidePredicate;
  }

  get canProcessAmount() {
    return this.concurrency - this.running;
  }

  get length() {
    return this.queue.length;
  }
}

export class ImagePendingQueue<Name extends string, Origin extends string | number> {
  name: Name;
  priority: number;
  limit: number;
  concurrency: number;
  prioritizeNew: boolean;
  offloadQueue?: ImagePendingQueue<Name, Origin>;

  private requests: Deque<ImageTaskSchema<Origin>>;

  constructor(opts: {
    name: Name;
    priority: number;
    limit: number; // may be Infinity
    concurrency: number; // may be Infinity
    prioritizeNew?: boolean;
    offloadQueue?: ImagePendingQueue<Name, Origin>;
  }) {
    this.name = opts.name;
    this.priority = opts.priority;
    this.limit = opts.limit;
    this.concurrency = opts.concurrency;
    this.prioritizeNew = opts.prioritizeNew ?? false;

    this.requests = new Deque<ImageTaskSchema<Origin>>();
    this.offloadQueue = opts.offloadQueue;
  }

  public enqueue(...requests: ImageTaskSchema<Origin>[]) {
    if (this.prioritizeNew) {
      requests.reverse(); // its ok to use reverse here
      requests.forEach((it) => this.requests.unshift(it));
    } else {
      requests.forEach((it) => this.requests.push(it));
    }

    this.offload(this.requests.length - this.limit);
  }

  public dequeue() {
    const amount = Math.min(this.concurrency, this.requests.length);

    return [...range(amount)].map(() => this.requests.shift());
  }

  public remove(predicate: (key: ImageTaskSchema<Origin>['key']) => boolean) {
    const requestsOutsidePredicate: ImageTaskSchema<Origin>[] = [];
    const requestsInsidePredicate: ImageTaskSchema<Origin>[] = [];

    this.requests.toArray().forEach((it) => {
      if (predicate(it.key)) {
        requestsInsidePredicate.push(it);
      } else {
        requestsOutsidePredicate.push(it);
      }
    });

    this.requests = new Deque<ImageTaskSchema<Origin>>(requestsOutsidePredicate);

    return requestsInsidePredicate;
  }

  // get rid of requests
  public offload(amount?: number) {
    const resolvedAmount = amount ?? this.requests.length;

    if (resolvedAmount <= 0) return;

    const items = [...range(resolvedAmount)]
      .map(() => (this.prioritizeNew ? this.requests.shift() : this.requests.pop()))
      .filter((it) => !!it) as ImageTaskSchema<Origin>[];

    this.offloadQueue?.enqueue(...items);
  }

  get length() {
    return this.requests.length;
  }
}

export enum ImageOptimizedLoaderQueueName {
  PRIME = 'prime',
  BACKGROUND = 'background',
  LIMBO = 'limbo',
}

export type ImageOptimizedLoaderSubscriberFunction<Key> = (
  imageItems: ImageOptimizedLoaderStateItem<Key>[]
) => void;

/**
 * - Pending queue: dont perform anything, intended to sort tasks by priority.
 * - Task queue: perform image request, limit amount of concurrent requests.
 * - State [this.state] should be stable, instead just mutate it.
 * - State items [this.state.get(...)] are unstable, in you change it, set new ref, preferably use this.setState.
 * - State item Images [this.state.get(...).image] created once for one image, its stable.
 */
export class ImageOptimizedLoader<Key, Origin extends string | number> {
  /**
   * - Prefer this.setState(...) over state.set(...).
   */
  private state: ImageOptimizedLoaderState<Key>;
  /**
   * - Use this.updateOrigin() from outside to update origins.
   * - All the origins used to load images by priority (index for now)
   * - Origin(server)s priority is resolved when task is performed at performSingleTask()
   * to react as fast as possible to origins update.
   */
  private origins: Origin[];

  private subscribers: Map<
    ImageOptimizedLoaderSubscriberFunction<Key>,
    string /* keyStr */ | null | undefined
  >;

  /**
   * - Pending queue: dont perform anything, intended to sort tasks by priority.
   */
  private pendingQueues: Map<
    ImageOptimizedLoaderQueueName,
    ImagePendingQueue<ImageOptimizedLoaderQueueName, Origin>
  >;

  /**
   * - Task queue: perform image requests, limit amount of concurrent requests.
   */
  private taskQueue: ImageTasksQueue;
  private taskQueueLimit = 5; // amount of requests to stop pushing from pending queue
  private taskQueueConcurrency = 3; // amount of concurrent/parallel requests

  constructor(opts: { origins: Origin[] }) {
    this.state = new Map();
    this.origins = opts.origins;

    if (!opts.origins.length) {
      throw new Error(
        `ImageOptimizedLoader: You must provide non empty array of origins or images wont load`
      );
    }

    this.pendingQueues = this.createPendingQueues();
    this.taskQueue = new ImageTasksQueue({
      concurrency: this.taskQueueConcurrency,
      onTaskComplete: () => this.performTasks(),
    });

    this.subscribers = new Map();
  }

  /**
   * Not overridable/hardcoded for now
   * Currently no need to DI queues
   */
  private createPendingQueues() {
    const limboQueue = new ImagePendingQueue({
      name: ImageOptimizedLoaderQueueName.LIMBO,
      limit: Infinity,
      priority: 3,
      concurrency: 1,
    });

    const primeQueue = new ImagePendingQueue({
      name: ImageOptimizedLoaderQueueName.PRIME,
      limit: 5,
      priority: 1,
      concurrency: Infinity,
      prioritizeNew: true,
      offloadQueue: limboQueue,
    });

    const backgroundQueue = new ImagePendingQueue({
      name: ImageOptimizedLoaderQueueName.BACKGROUND,
      limit: Infinity,
      priority: 2,
      concurrency: 5,
      offloadQueue: limboQueue,
    });

    return new Map(
      [primeQueue, backgroundQueue, limboQueue]
        .sort((a, b) => a.priority - b.priority)
        .map((it) => [it.name, it])
    );
  }

  /**
   * - Performs image request
   */
  private async performSingleTask(task: ImageTaskSchema<Origin>) {
    const imageState = this.state.get(task.key);

    if (!imageState?.image) return;

    this.setState(task.key, {
      ...imageState,
      status: ImageOptimizedLoaderStateStatus.PENDING,
    });

    const images = this.origins.map((origin) => task.images[origin]).filter((it) => !!it.src);

    for (const image of images) {
      try {
        // !READERDEBUG
        // const debugSuffix = `?ch4=${task.key.replaceAll('"', 'c')}`;
        imageState.image.src = image.src; // + debugSuffix;

        const { promise, resolve, reject } = promiseWithResolvers();

        this.setState(task.key, {
          ...imageState,
          abort: () => {
            reject(createAbortError());
          },
          status: ImageOptimizedLoaderStateStatus.PENDING,
        });

        imageState.image.onload = () => resolve(1);
        imageState.image.onerror = () => {
          const loadingError = new ImageOptimizedLoaderError({
            key: task.key,
            src: image.src,
            info: 'loading error',
          });
          reject(loadingError);
        };

        await promise;

        this.setState(task.key, {
          ...imageState,
          status: ImageOptimizedLoaderStateStatus.SUCCESS,
        });

        return;
      } catch (e: unknown) {
        if (isAbortError(e)) {
          imageState.image.src = TRANSPARENT_EMPTY_IMAGE_PLACEHOLDER;

          this.setState(task.key, {
            ...imageState,
            status: ImageOptimizedLoaderStateStatus.IDLE,
          });
          return; // stop loading other origins on abort
        }

        const error =
          e instanceof ImageOptimizedLoaderError
            ? e
            : new ImageOptimizedLoaderError({
                key: task.key,
                src: image.src,
                info: 'unknown error',
              });

        // logger.error(error.message);
        captureException(error.message);
      }
    }

    if (!images.length) {
      logger.warn(`ImageOptimizedLoader: No images provided for ${task.key}`);
    }

    // error state also for !images.length
    this.setState(task.key, {
      ...imageState,
      status: ImageOptimizedLoaderStateStatus.ERROR,
    });
  }

  /**
   * - Moves task from pending qeueus to taskQueue, that will perform requests
   */
  private performTasks() {
    for (const pendingQueue of this.pendingQueues.values()) {
      if (this.taskQueue.length >= this.taskQueueLimit) break;

      const tasks = pendingQueue.dequeue();

      tasks.forEach((task) => {
        if (!task) return;

        const state = this.state.get(task.key);

        if (!state) return;
        if (state.status === ImageOptimizedLoaderStateStatus.SUCCESS) return;

        this.taskQueue.enqueue(
          { fn: () => this.performSingleTask(task), key: task.key },
          pendingQueue.prioritizeNew
        );
      });
    }
  }

  /**
   * Update origins/origins order
   */
  public updateOrigins(origins: Origin[]) {
    if (!origins.length) {
      throw new Error(
        `ImageOptimizedLoader: You must provide non empty array of origins or images wont load`
      );
    }

    this.origins = origins;

    this.retry({ predicate: () => true, queue: ImageOptimizedLoaderQueueName.BACKGROUND });
  }

  /**
   * - Enqueue image loading
   * - You can load image with the same key multiple times
   * - Pending queue can contain only one image with the same key
   * - But! One image may be in multiple pending queues, it will resolve the first loaded image, other reqeusts will not run
   */
  public load(
    opts: Pick<ImageTaskSchema<Origin>, 'images'> & {
      key: Key | string;
      queue: ImageOptimizedLoaderQueueName;
    }
  ) {
    const keyStr = this.resolveKey(opts.key);
    if (!keyStr) return;

    const state = this.state.get(keyStr) ?? this.createImageItem(keyStr);

    if (
      state.status === ImageOptimizedLoaderStateStatus.PENDING ||
      state.status === ImageOptimizedLoaderStateStatus.SUCCESS
    )
      return;

    const queue = this.pendingQueues.get(opts.queue);
    if (!queue) throw new Error(`ImageOptimizedLoader: You should provide an existing queue name`);

    this.setState(keyStr, {
      ...state,
      retry: (queue: ImageOptimizedLoaderQueueName) =>
        this.load({
          key: keyStr,
          images: opts.images,
          queue,
        }),
      status: ImageOptimizedLoaderStateStatus.PENDING,
    });

    queue.enqueue({
      key: keyStr,
      images: opts.images,
    });

    this.performTasks();
  }

  /**
   * - Aborts image loading
   * - Removes image from pending queues (or selected)
   */
  public abort(opts: { predicate: (key: Key) => boolean; queue?: ImageOptimizedLoaderQueueName }) {
    const queue = opts.queue ? this.pendingQueues.get(opts.queue) : null;
    const pendingQueues = queue ? [queue] : Array.from(this.pendingQueues.values());

    [this.taskQueue, ...pendingQueues].forEach((it) =>
      it
        .remove((keyStr) => opts.predicate(this.deserializeKey(keyStr)))
        .forEach(({ key }) => {
          const item = this.state.get(key);
          if (!item) return;

          this.setState(key, {
            ...item,
            abort: undefined,
            status: ImageOptimizedLoaderStateStatus.IDLE,
          });
        })
    );

    const stateSlice = [...this.state.values()].filter(
      (it) =>
        it.status === ImageOptimizedLoaderStateStatus.PENDING &&
        !!it.abort &&
        opts.predicate(it.key)
    );

    stateSlice.forEach((it) => {
      it.abort?.();

      this.setState(this.serializeKey(it.key), {
        ...it,
        abort: undefined,
        status: ImageOptimizedLoaderStateStatus.IDLE,
      });
    });
  }

  /**
   * Retry errored requests
   */
  public retry(opts: { predicate: (key: Key) => boolean; queue: ImageOptimizedLoaderQueueName }) {
    const stateSlice = [...this.state.values()].filter(
      (it) =>
        it.status === ImageOptimizedLoaderStateStatus.ERROR && !!it.retry && opts.predicate(it.key)
    );

    stateSlice.forEach((it) => it.retry?.(opts.queue));
  }

  /**
   * Create new state item from outside
   * Probably useless since this.load() creates image item if not exists
   */
  public createImage(key: Key): HTMLImageElement {
    const imageItem = this.createImageItem(this.serializeKey(key));

    return imageItem.image;
  }

  private createImageItem(keyStr: string) {
    const existingItem = this.state.get(keyStr);

    if (existingItem) return existingItem;

    const imageItem = {
      image: new Image(),
      key: this.deserializeKey(keyStr),
      status: ImageOptimizedLoaderStateStatus.IDLE,
    };

    this.setState(keyStr, imageItem);

    return imageItem;
  }

  public removeImage(key: Key) {
    const keyStr = this.serializeKey(key);

    if (!this.state.has(keyStr)) return;

    this.state.delete(keyStr);
    this.emitStateUpdate(keyStr);
  }

  public getState() {
    return this.state;
  }

  public getStateByKey(key: Key | string) {
    const resolvedKey = this.resolveKey(key);
    if (!resolvedKey) return;

    return this.state.get(resolvedKey);
  }

  public cleanup(opts: { predicate: (key: Key) => boolean }) {
    [this.taskQueue, ...this.pendingQueues.values()].forEach((queue) => {
      queue.remove((keyStr) => opts.predicate(this.deserializeKey(keyStr)));
    });

    const keyStrSet = new Set<string>();

    for (const [keyStr, it] of this.state.entries()) {
      const shouldCleanup = opts.predicate(it.key);

      if (!shouldCleanup) return;

      it.abort?.();
      this.state.delete(keyStr);
      keyStrSet.add(keyStr);
    }

    this.emitStateUpdate(keyStrSet);
  }

  /**
   * Subscribe to store updates
   */
  public subscribe(fn: ImageOptimizedLoaderSubscriberFunction<Key>, key?: Key | string | null) {
    this.subscribers.set(fn, this.resolveKey(key));
  }

  /**
   * Unsubscribe to store updates
   */
  public unsubscribe(fn: ImageOptimizedLoaderSubscriberFunction<Key>) {
    this.subscribers.delete(fn);
  }

  /**
   * Prefer to use this.setState instead
   * Used to trigger subscribers just after this.state mutation
   */
  private emitStateUpdate(keyStr: Set<string> | string) {
    const imageItems =
      typeof keyStr === 'string'
        ? [this.state.get(keyStr)]
        : [...keyStr].map((it) => this.state.get(it));

    const filtered = imageItems.filter((it) => !!it);

    filtered.forEach((it) => {
      it.image.dataset.status = it.status;
    });

    for (const [fn, subscriberKeyStr] of this.subscribers.entries()) {
      if (subscriberKeyStr && subscriberKeyStr !== keyStr) continue;

      fn(filtered);
    }
  }

  private setState(keyStr: string, value: ImageOptimizedLoaderStateItem<Key>) {
    this.state.set(keyStr, { ...value });
    this.emitStateUpdate(keyStr);
  }

  public serializeKey(key: Key): string {
    return JSON.stringify(key);
  }

  public deserializeKey(keyStr: string): Key {
    return JSON.parse(keyStr);
  }

  private resolveKey(key?: Key | string | null) {
    if (key == null) return null;

    return typeof key === 'string' ? key : this.serializeKey(key);
  }
}
