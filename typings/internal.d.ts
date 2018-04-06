declare module 'toastr' {
  var toastr: Toastr
  export = toastr
}

interface Toastr {
  success(message: string): void
  info(message: string): void
  warning(message: string): void
  error(message: string): void
  options: any
}

declare module 'http-proxy' {
  const api: any
  export = api
}

declare module 'ssh2' {
  const api: any
  export = api
}

declare module 'tar-fs' {
  const api: {
    pack(directory: string, options?: any): NodeJS.ReadableStream
    extract(directory: string, options?: any): NodeJS.WritableStream
  }

  export = api
}

declare module 'compression' {
  namespace api {

  }
  function api(): any
  export = api
}

declare module 'body-parser' {
  namespace api {
    function json(): any
  }
  function api(): any
  export = api
}
