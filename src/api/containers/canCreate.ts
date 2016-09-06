import db from '../../data/connection';
import * as codes from '../../types/codes';
import NewContainerType = codes.NewContainerType;

/**
 * Can a container with the provided options be created 
 */
export default function canCreate(subdomain: string, newContainerType?: NewContainerType): Promise<boolean> {
    newContainerType = newContainerType || NewContainerType.Normal;

    if (newContainerType === NewContainerType.Change) return Promise.resolve(true);
    subdomain = subdomain.toLocaleLowerCase();

    return db('Containers')
        .select()
        .where({ subdomain: subdomain })
        .then((results: any[]) => {
            if (results.length > 0) return false;
            return true;
        });

}