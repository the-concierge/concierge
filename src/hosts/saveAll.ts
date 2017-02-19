import db from '../data/connection'
import makeDirectory from '../ssh/makeDirectory'
import readDirectory from '../ssh/readDirectory'

export default async function saveAll (request: Concierge.SaveRequest<Concierge.Host>) {
  const trx = await db.getTransaction()
  try {
    await doInserts(trx, request.inserts)
    await doUpdates(trx, request.updates)
    await trx.commit()
    return true
  } catch (error) {
    await (trx.rollback())
    throw error
  }
}

// tslint:disable-next-line:space-before-function-paren
async function doInserts(trx: any, models: Concierge.Host[]) {
  await (createVolumePaths(models))
  for (const model of models) {
    delete model.id
    await db('Hosts')
      .insert(model)
      .transacting(trx)
  }
}

async function doUpdates(trx: any, models: Concierge.Host[]): Promise<void> {
  if (models.length === 0) {
    return
  }
  for (const model of models) {
    await db('Hosts')
      .update(model)
      .where({ id: model.id })
      .transacting(trx)
  }
}

async function createVolumePaths(hosts: Concierge.Host[]) {
  const volumesCreated: boolean[] = []
  for (const host of hosts) {
    const aleadyExists = await (readDirectory(host, ''))
    if (aleadyExists) {
      volumesCreated.push(true)
      continue
    }

    try {
      await (makeDirectory(host, ''))
      log.info(`Created volume path for ${host.hostname}`)
      volumesCreated.push(true)
      continue
    } catch (ex) {
      log.error(`Failed to create volume path for ${host.hostname}: ${ex.message}`)
      volumesCreated.push(false)
      continue
    }
  }
  return volumesCreated.every(result => result === true)
}