import db from '../data/connection'

/**
 * Ensure an applicationId:variantName combination is valid
 */
export default async function isValid(applicationId: number, variantName: string) {
  const appId = Number(applicationId)

  const rows = await db('Variants')
    .select()
    .where('name', variantName)
    .andWhere('application', appId)

  const isValid = rows.length === 1
  return isValid
}