import dayjs from 'dayjs';

import { LogLevel, Transport } from '@re/core/lib/logger';

/**
 * Color handling copied from Kleur
 *
 * @see https://github.com/lukeed/kleur/blob/fa3454483899ddab550d08c18c028e6db1aab0e5/colors.mjs#L13
 */
const colors: {
  [key: string]: [number, number];
} = {
  default: [0, 0],
  green: [32, 39],
  magenta: [35, 39],
  red: [31, 39],
  yellow: [33, 39],
};

function withColor([x, y]: [number, number]) {
  const rgx = new RegExp(`\\x1b\\[${y}m`, 'g');
  const open = `\x1b[${x}m`,
    close = `\x1b[${y}m`;

  return function (txt: string) {
    if (txt == null) return txt;

    return open + (~`${txt}`.indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}

/**
 * Used in dev mode to nicely log to the console
 */
export const consoleTransport: Transport = (level, message, metadata) => {
  const timestamp = dayjs().format('HH:mm:ss');
  const extra = Object.keys(metadata).length ? ` ${JSON.stringify(metadata, null, '  ')}` : '';
  const color = {
    [LogLevel.Debug]: colors.magenta,
    [LogLevel.Info]: colors.default,
    [LogLevel.Log]: colors.default,
    [LogLevel.Warn]: colors.yellow,
    [LogLevel.Error]: colors.red,
    [LogLevel.Fatal]: colors.red,
  }[level]!;
  // needed for stacktrace formatting in dev env
  const devLog = level === LogLevel.Error ? console.error : console.log;
  // no console.error for lighthouse in prod env
  const prodLog = console.log;

  const log = process.env.NODE_ENV === 'development' ? devLog : prodLog;
  // if (LOG_PUSH_ENABLED) {
  //     push({
  //         timestamp,
  //         level,
  //         message,
  //         metadata,
  //     });
  // }

  log(`${timestamp} ${withColor(color)(`[${level.toUpperCase()}]`)} ${message.toString()}${extra}`);
};
