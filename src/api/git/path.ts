import { resolve } from 'path'

/**
 * Get the Git repository path for an Application
 */
export default function getApplicationRepoPath(application: Schema.Application) {
  return resolve(__dirname, '../../../repositories', application.id.toString())
}
