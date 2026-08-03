export enum LogLevel {
    Debug = 'debug',
    Info = 'info',
    Log = 'log',
    Warn = 'warn',
    Error = 'error',
    Fatal = 'fatal',
}

export type Transport = (
    level: LogLevel,
    message: string | RemangaError | Error,
    metadata: Metadata,
) => void;

export type TransportScope = {
    include?: string[];
    exclude?: string[];
};

export type LogScope = string[];

/**
 * A union of some of Sentry's breadcrumb properties as well as Sentry's
 * `captureException` parameter, `CaptureContext`.
 */
export type Metadata<Extend = {}> = {
    /**
     * Applied as Sentry breadcrumb types. Defaults to `default`.
     *
     * @see https://develop.sentry.dev/sdk/event-payloads/breadcrumbs/#breadcrumb-types
     */
    type?:
        | 'default'
        | 'debug'
        | 'error'
        | 'navigation'
        | 'http'
        | 'info'
        | 'query'
        | 'transaction'
        | 'ui'
        | 'user';

    scope?: LogScope;

    /**
     * Passed through to `Sentry.captureException`
     *
     * @see https://github.com/getsentry/sentry-javascript/blob/903addf9a1a1534a6cb2ba3143654b918a86f6dd/packages/types/src/misc.ts#L65
     */
    tags?: {
        [key: string]: number | string | boolean | bigint | symbol | null | undefined;
    };

    /**
     * Any additional data, passed through to Sentry as `extra` param on
     * exceptions, or the `data` param on breadcrumbs.
     */
    [key: string]: unknown;
} & Extend;

const enabledLogLevels: {
    [key in LogLevel]: LogLevel[];
} = {
    [LogLevel.Debug]: [LogLevel.Debug, LogLevel.Info, LogLevel.Log, LogLevel.Warn, LogLevel.Error],
    [LogLevel.Info]: [LogLevel.Info, LogLevel.Log, LogLevel.Warn, LogLevel.Error],
    [LogLevel.Log]: [LogLevel.Log, LogLevel.Warn, LogLevel.Error],
    [LogLevel.Warn]: [LogLevel.Warn, LogLevel.Error],
    [LogLevel.Error]: [LogLevel.Error],
    [LogLevel.Fatal]: [LogLevel.Fatal],
};

export class RemangaError extends Error {}

export type DebugContext = Record<string, string>;

/**
 * Use log scope to define scope for logger.[level]()
 *
 * Use transport scope to define which log scopes it includes/excludes
 * If includes field is not defined, transport would process all the logs
 * If it is then transport would process logs only with this scope.
 *
 */
export const isInScope = (logScope?: LogScope, transportScope?: TransportScope) => {
    if (!logScope || !logScope.length) return true;

    const resolvedTransportScope = {
        include: transportScope?.include ?? [],
        exclude: transportScope?.exclude ?? [],
    };

    for (const logScopeItem of logScope) {
        if (resolvedTransportScope.exclude.includes(logScopeItem)) return false;

        if (
            resolvedTransportScope.include.length &&
            resolvedTransportScope.include.includes(logScopeItem)
        )
            return false;
    }

    return true;
};

/**
 * Main class. Defaults are provided in the constructor so that subclasses are
 * technically possible, if we need to go that route in the future.
 */
export class Logger {
    LogLevel = LogLevel;
    DebugContext: DebugContext;

    enabled: boolean;
    level: LogLevel;
    transports: Transport[] = [];

    protected debugContextRegexes: RegExp[] = [];

    constructor({
        enabled = true,
        level = LogLevel.Log,
        debug = '',
        debugContext = {},
    }: {
        enabled?: boolean;
        level?: LogLevel;
        debug?: string;
        debugContext?: DebugContext;
    } = {}) {
        this.enabled = enabled !== false;
        this.level = debug ? LogLevel.Debug : (level ?? LogLevel.Warn);
        this.debugContextRegexes = (debug || '')
            .split(',')
            .map((context) => new RegExp(context.replace(/[^\w:*]/, '').replace(/\*/g, '.*')));
        this.DebugContext = debugContext;
    }

    debug(message: string, metadata: Metadata = {}, context?: string) {
        if (context && !this.debugContextRegexes.find((reg) => reg.test(context))) return;
        this.transport(LogLevel.Debug, message, metadata);
    }

    info(message: string, metadata: Metadata = {}) {
        this.transport(LogLevel.Info, message, metadata);
    }

    log(message: string, metadata: Metadata = {}) {
        this.transport(LogLevel.Log, message, metadata);
    }

    warn(message: string, metadata: Metadata = {}) {
        this.transport(LogLevel.Warn, message, metadata);
    }

    error(error: unknown, metadata: Metadata = {}) {
        if (error instanceof RemangaError || error instanceof Error) {
            this.transport(LogLevel.Error, error, metadata);
            return;
        }

        this.transport(LogLevel.Error, new RemangaError(JSON.stringify(error)), metadata);
    }

    addTransport(transport: Transport) {
        this.transports.push(transport);
        return () => {
            this.transports.splice(this.transports.indexOf(transport), 1);
        };
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    protected transport(level: LogLevel, message: string | RemangaError, metadata: Metadata = {}) {
        if (!this.enabled) return;
        if (!enabledLogLevels[this.level].includes(level)) return;

        for (const transport of this.transports) {
            // metadata fallback accounts for JS usage
            transport(level, message, metadata || {});
        }
    }
}
