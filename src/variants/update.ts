import db from '../data/connection'

export default function update(variant: OptionalVariant) {
  return db('Variants')
    .where({ name: variant.name })
    .update(variant)
}

interface OptionalVariant {
  name?: string
  application?: number
  buildState?: string
  buildTime?: number
}