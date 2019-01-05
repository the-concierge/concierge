import * as knex from 'knex'
import { APPLICATIONS, CREDENTIALS } from '..'

type Application = Schema.Application & { username: string; key: string }

export async function up(db: knex) {
  // Create new credential records for applications prior to dropping the columns
  const apps: Application[] = await db(APPLICATIONS).select()
  for (const app of apps) {
    if (!app.username) {
      continue
    }

    const cred: Omit<Schema.Credentials, 'id'> = {
      name: `${app.name} (auto-generated)`,
      username: app.username,
      key: app.key
    }

    const [id] = await db(CREDENTIALS).insert(cred)
    await db(APPLICATIONS)
      .update({ credentialsId: id, key: '', username: '' })
      .where('id', app.id)
  }

  await db.schema.table(APPLICATIONS, tbl => {
    tbl.dropColumns('username', 'key')
  })
}

export async function down(_: knex) {
  throw new Error('Down migrations not supported')
}
