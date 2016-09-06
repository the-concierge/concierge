import db from '../../data/connection';
import * as states from '../../types/states';
import ActiveState = states.ActiveState;
import Config = Concierge.Configuration;
import gitApis from '../tags';

/**
 * Ideally, it'd be nice to depcrate the Configuration cache
 * It cannot be deprecated as some other functions that perform transaction require the Configuration
 * and the `get` function below performs the database call
 * 
 * Lesson learned: Return a QueryBuilder<T> object from all DB APIs where T is the type of the object expected from the database
 * Only the top-most modules should execute queries. E.g. route handlers
 */
let configCache: Config = null;
export default () => configCache;

export const initialise = async(() => {
    configCache = await(get());
    return true;
});

export const get = async((): Concierge.Configuration => {
    const config: Concierge.Configuration = await(db('Configurations')
        .select()
        .where('isActive', ActiveState.Active)
        .then(configs => configs[0]));

    return config;
});

export const setCache = (config: Config) => {
    configCache = <any>config;
};