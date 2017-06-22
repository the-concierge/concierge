/// <reference types="node" />
/// <reference path="./analysis/analysis.d.ts" />

interface Window {
  containerPoller: any;
}

interface Logger {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string) => void;
}

declare const log: Logger;

declare module "toastr" {
  var toastr: Toastr;
  export = toastr;
}

interface Toastr {
  success(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  options: any;
}

declare module Concierge {
  interface Concierge {
    id: number;
    label: string;
    hostname: string;
    port: number;
  }

  interface HeartBeat {
    containerId: number;
    cpu: string;
    memory: string;
    responseTime: number;
    timestamp: number;
  }

  interface Registry {
    url: string;
    getUntaggedImage: (application: Application) => string;
    getTaggedImage: (application: Application, tag: string) => string;
  }

  interface Configuration {
    name: string;
    conciergePort: number;
    proxyHostname?: string;
    proxyIp?: string;
    httpPort: number;
    debug: number;
    heartbeatFrequency: number;
    heartbeatBinSize: number;
    dockerRegistry?: string;
  }

  interface Application {
    id: number
    name: string

    /** {namespace}/{repository} */
    repository: string

    /** For fetching/cloning the repository */
    key: string
  }

  interface NewContainer {
    subdomain: string;
    variant: string;
    label: string;
    host?: string;
    volume?: Buffer;
    dockerImage?: string;
    applicationId?: number;

    /** JSON representation of Array<string> */
    variables: string;
  }

  interface Host {
    id?: number;
    hostname: string;
    capacity: number;
    dockerPort: number;
    sshPort: number;
    sshUsername: string;
    // volumesPath: string;
    privateKey?: string;
  }

  interface Entity {
    type: string;
    name: string;
  }

  interface Event extends Entity {
    event: any;
  }

  interface Stats {
    containerId: number;
    cpu: Box;
    memory: Box;
    responseTime: number;
    timestamp: number;
  }

  interface Box {
    mean: number;
    mode: number[];
    median: number;
    range: {
      minimum: number,
      maximum: number,
      difference: number
    };
    lowerQuartile: number;
    upperQuartile: number;
  }

  interface SourceControlApi {
    getTags: (application: Application) => Promise<Array<string>>;
    getRepository: (application: Application) => string;
    privateBaseUrl: string;
    publicBaseUrl: string;
  }

  interface Archive {
    application: string;
    filename: string;
    subdomain: string;
    timestamp: number;
    variant: string;
    date: string;
  }
}

declare module 'ip' {
  const api: any;
  export = api;
}

declare module 'http-proxy' {
  const api: any;
  export = api;
}

declare module 'ssh2' {
  const api: any;
  export = api;
}

declare module 'tar-fs' {
  const api: {
    pack(directory: string, options?: any): NodeJS.ReadableStream;
    extract(directory: string, options?: any): NodeJS.WritableStream;
  };

  export = api;
}

declare module 'inert' {
  const api: any;
  export = api;
}

declare module 'rimraf' {
  const api: any;
  export = api;
}

declare module 'compression' {
  namespace api { }
  function api(): any;
  export = api;
}

declare module 'body-parser' {
  namespace api {
    function json(): any
  }
  function api(): any;
  export = api;
}
