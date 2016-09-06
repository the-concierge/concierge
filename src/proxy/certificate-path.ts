import * as path from 'path';

export function getCertPath(domain: string) {
    return path.resolve(baseDomainPath(domain), `${domain}.cert`);
}

export function getKeyPath(domain: string) {
    return path.resolve(baseDomainPath(domain), `${domain}.key`);
}

export function baseDomainPath(domain: string) {
    return path.resolve(rootCertificatePath, domain);
}

export const rootCertificatePath = path.resolve('./certificates');