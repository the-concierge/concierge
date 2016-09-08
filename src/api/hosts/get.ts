import db from '../../data/connection';

export const one = async((hostName: string | number): Concierge.Host => {
    let query = await(db('Hosts')
        .select()
        .where('hostname', hostName)
        .orWhere('id', hostName));
    return query[0];
});

export const all = async((): Concierge.Host[] => {
    let query = await(db('Hosts').select());
    return query;
});