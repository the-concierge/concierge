import * as yaml from 'js-yaml'
import { parse as parseV1, V1Task } from './v1'

const parsers = [parseV1]

export type Task = V1Task

export function parseTaskFile(content: string, extension: string) {
  const file = loadFile(content, extension)
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

function loadFile(content: string, extension: string) {
  // .JSON
  if (extension === '.json') {
    try {
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  // YML/YAML
  try {
    const file = yaml.safeLoad(content)
    return file
  } catch (_ex) {
    return null
  }
}
