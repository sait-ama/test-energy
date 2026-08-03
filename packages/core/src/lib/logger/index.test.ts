import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger, LogLevel, RemangaError } from './index';

describe('Logger', () => {
  let logger: Logger;
  let transport: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logger = new Logger();
    transport = vi.fn();
    logger.addTransport(transport);
    logger.enable();
  });

  it('calls transport for log', () => {
    logger.log('msg');
    expect(transport).toHaveBeenCalledWith(LogLevel.Log, 'msg', {});
  });

  it('does not call transport if disabled', () => {
    logger.disable();
    logger.log('msg');
    expect(transport).not.toHaveBeenCalled();
  });

  it('addTransport returns unsubscribe', () => {
    const t = vi.fn();
    const unsub = logger.addTransport(t);
    unsub();
    logger.log('msg');
    expect(t).not.toHaveBeenCalled();
  });

  it('error wraps non-error in RemangaError', () => {
    logger.error('fail');
    expect(transport.mock.calls[0][1]).toBeInstanceOf(RemangaError);
  });

  it('error passes Error as is', () => {
    const err = new Error('fail');
    logger.error(err);
    expect(transport.mock.calls[0][1]).toBe(err);
  });
});
