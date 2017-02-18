import * as LE from 'letsencrypt'
import { rootCertificatePath } from './certificate-path'
import { get as getChallengeValue, set as setChallengeValue } from './challenge-server'
import { get as getConfig } from '../api/configurations/get'

const handlers = {
  getChallenge: (options, hostname, key, callback) => {
    callback(null, getChallengeValue(key))
  },
  setChallenge: (options, hostname, key, value, callback) => {
    setChallengeValue(key, value)
    callback(null, null)
  },
  removeChallenge: (options, hostname, key, callback) => {
    // noop
    if (!callback) {
      return
    }
    callback(null, null)
  }
}

async function getService() {
  const config = await getConfig()
  const acmeServer = config.useProductionCertificates
    ? LE.productionServerUrl
    : LE.stagingServerUrl

  return LE.create({
    configDir: rootCertificatePath,
    server: acmeServer,
    privkeyPath: ':config/:hostname/private.key',
    fullchainPath: ':config/:hostname/fullchain.pem',
    certPath: ':config/:hostname/cerificate.cert',
    chainPath: ':config/:hostname/chain.pem',
    webrootPath: ':config/acme-challenge',
    debug: Number(config.debug) === 1
  }, handlers)
}

export default getService