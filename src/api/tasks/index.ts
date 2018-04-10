import * as yaml from 'js-yaml'
import { parse as parseV1, V1Task } from './v1'

const parsers = [parseV1]

export type Task = V1Task

export function parseTaskFile(content: string) {
  const file = loadFile(content)
  if (!file) {
    return null
  }

  for (const parser of parsers) {
    const cfg = parser(file)
    if (cfg) {
      return cfg
    }
  }

  return null
}

function loadFile(content: string) {
  try {
    const file = yaml.safeLoad(content)
    return file
  } catch (_ex) {
    return null
  }
}
