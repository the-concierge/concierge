import * as log from '../logger';
import { readFile } from 'fs';
import { resolve, join } from 'path';
import db from './connection';
import * as os from 'os';
import createDb from './create';

const BASE_DB_PATH = resolve(__dirname, '../../db');
const LIVE_DB = join(BASE_DB_PATH, 'concierge.db');

// Using lazy initialisation until a more maintainable alternative is implemented
export default async(() => {
    let isLiveDbPresent = await(isFilePresent(LIVE_DB));

    if (isLiveDbPresent) return false;

    await(createDb());

    const defaultName = os.hostname() || 'development';
    await(db('Configurations')
        .insert({ name: defaultName }));

    log.info(`Concierge renamed to: ${defaultName}`);
    return true;
});

const isFilePresent = async((filename: string): boolean => {
    const filePresent = new Promise<boolean>((resolve, reject) => {
        readFile(filename, error => {
            if (error) return resolve(false);
            resolve(true);
        });
    });
    return await(filePresent);
});