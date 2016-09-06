import certService from './certificate-service';
import * as LE from 'letsencrypt';
import { baseDomainPath, getCertPath, getKeyPath } from './certificate-path';
import * as fs from 'fs';
import * as log from '../logger';

export default function createCertificate(domain: string) {
    return _createCertificate(domain);
}

const _createCertificate = async((domain: string) => {
    /** We don't actually care about the result of this... */
    const isCreated = await(createCertificateDomainDirectory(domain));
    const service = await(certService());
    const result = await(register(service, domain));
    return result;
});

function register(service: LE.LetsEncryptInstance, domain: string) {
    return new Promise((resolve, reject) => {
        service.register({
            domains: [domain],
            email: 'carl@paypac.com.au', // get from config?
            agreeTos: true
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            fs.writeFileSync(getCertPath(domain), result.cert);
            log.info(`[CERT:${domain}] Saved certificate`);
            fs.writeFileSync(getKeyPath(domain), result.key);
            log.info(`[CERT:${domain}] Saved key`);
            resolve(result);
        });
    });
}

function createCertificateDomainDirectory(domain: string): Promise<boolean> {
    const domainPath = baseDomainPath(domain);
    const promise = new Promise<boolean>((resolve, reject) => {
        fs.stat(domainPath, (error, stats) => {
            if (!error) return resolve(true);

            fs.mkdir(domainPath, error => {
                if (error) return reject(error);
                return resolve(true);
            });
        });
    });
    return promise;
}