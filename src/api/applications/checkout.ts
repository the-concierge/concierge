import pack from '../git/pack'

export async function checkout(app: Concierge.Application, sha: string) {
  /**
   * TODO
   * - Switch over to shallow clones (clone with --depth 1)
   * - Concierge maintains a long-lived repository folder for tracking remotes
   * - Hosts will always clone: git clone -b [SHA] --single-branch --depth 1 [repo] [temp-location]
   */

  // TODO: This should use a specific host
  const stream = await pack(app, sha)
  return stream
}
