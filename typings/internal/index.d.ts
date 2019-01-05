/// <reference types="node" />
/// <reference path="../analysis/analysis.d.ts" />

declare module '*.vue' {
  const component: any
  export default component
}

interface Logger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
}

declare const log: Logger

declare namespace NodeJS {
  interface Global {
    log: Logger
  }
}

type Diff<T, U> = T extends U ? never : T

type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>

type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : any