import certService from './certificate-service'
import * as LE from 'letsencrypt'
import { baseDomainPath, getCertPath, getKeyPath } from './certificate-path'
import * as fs from 'fs'
import * as log from '../logger'
import { get as getConfig } from '../api/configurations/get'

export default async function createCertificate (domain: string) {
    /** We don't actually care about the result of this... */
    const isCreated = await createCertificateDomainDirectory(domain)
    const service = await certService()
    const result = await register(service, domain)
    return result
}

async function register (service: LE.LetsEncryptInstance, domain: string) {
    const config = await getConfig()
    if (config.certificateEmail === 'user@email.com.invalid') {
        throw new Error('Certificate Email Address in Configuration has not been changed')
    }

    return new Promise((resolve, reject) => {
        service.register({
            domains: [domain],
            email: config.certificateEmail,
            agreeTos: true
        }, (error, result) => {
            if (error) {
                return reject(error)
            }
            fs.writeFileSync(getCertPath(domain), result.cert)
            log.info(`[CERT:${domain}] Saved certificate`)
            fs.writeFileSync(getKeyPath(domain), result.key)
            log.info(`[CERT:${domain}] Saved key`)
            resolve(result)
        })
    })
}

function createCertificateDomainDirectory (domain: string): Promise<boolean> {
    const domainPath = baseDomainPath(domain)
    const promise = new Promise<boolean>((resolve, reject) => {
        fs.stat(domainPath, (error, stats) => {
            if (!error) return resolve(true)

            fs.mkdir(domainPath, error => {
                if (error) return reject(error)
                return resolve(true)
            })
        })
    })
    return promise
}