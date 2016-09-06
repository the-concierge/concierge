import { getCertPath } from './certificate-path';
import * as fs from 'fs';

export default function certificateExists(domain: string): Promise<boolean> {
    const certFilePath = getCertPath(domain);
    const promise = new Promise<boolean>((resolve, reject) => {
        fs.stat(certFilePath, (error: any | undefined, stat) => {
            resolve(!!stat);
        });
    });
    return promise;
}
