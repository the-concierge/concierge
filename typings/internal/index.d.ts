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
