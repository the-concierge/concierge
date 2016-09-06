import appPath from './appPath';
import * as rimraf from 'rimraf';

/**
 * Delete the Git repository folder of an Application
 */
export default function remove(application: Concierge.Application) {
    const promise = new Promise<boolean>((resolve, reject) => {
        const directory = appPath(application);
        
        rimraf(directory, {}, error => {
            if (error) {
                log.error(`[DELETEREPO] Failed to remove ${directory}: ${error}`);
                return reject(error);
            }
            resolve(true);
        }) 
    
    });

    return promise;
}