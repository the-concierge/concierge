import * as getConcierges from './get'
import * as request from '../request'

/**
 * Fetch one or all containers from a remote Concierge
 */
export async function one(conciergeId: number | Concierge.Concierge) {
  if (isNum(conciergeId)) {
    let concierge = await getConcierges.one(conciergeId)
    return await request.get(toUrl(concierge))
  } else {
    return await request.get(toUrl(conciergeId))
  }
}

function isNum(value): value is number {
  return typeof value === 'number'
}

export async function all(): Promise<Concierge.Container[]> {
  const concierges = await getConcierges.all()
  const containerLists = []
  for (const concierge of concierges) {
    const list = await request.get(toUrl(concierge))
    containerLists.push(list)
  }
  const results = containerLists.map(result => JSON.parse(result) as Concierge.Container[])
  return [].concat(...results)
}

function toUrl(concierge: Concierge.Concierge) {
  let url = `http://${concierge.hostname}:${concierge.port}/containers`
  return url
}
