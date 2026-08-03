import { EnvSchema } from '../../../config/next/env';

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema, NodeJS.ProcessEnv {}
  }
}
