export interface V1Task {
  version: 'v1'
  /**
   * Reference another config file instead of this one
   * E.g. for the purposes of containing secrets
   */
  use?: string

  /** After successfully checking out */
  checkout: string[]

  /** On build success */
  success: string[]

  /** On build failure */
  fail: string[]

  /**
   * On build complete -- success or failure
   * Executed after success/failure tasks
   */
  complete: string[]
}

export function parse(content: any): V1Task | null {
  if (content.version !== 'v1') {
    return null
  }

  const version: 'v1' = content.version
  const use = content.use ? content.use.toString() : undefined
  const checkout = toCommands(content.checkout)
  const success = toCommands(content.success)
  const fail = toCommands(content.fail)
  const complete = toCommands(content.complete)

  return {
    version,
    use,
    checkout,
    success,
    fail,
    complete
  }
}

function toCommands(prop: any): string[] {
  if (!prop) {
    return []
  }

  if (Array.isArray(prop)) {
    return prop.map(p => p.toString())
  }

  return [prop.toString()]
}
