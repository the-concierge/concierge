import db from '../../data/connection';

export const one = async((id: number): Concierge.Container => {
    return await(db('Containers')
        .select(columns)
        .where('Containers.id', id)
        .leftJoin(joinClause[0], joinClause[1], joinClause[2]))[0];
});

export const all = async((): Concierge.Container[] => {
    return await(
        db('Containers')
        .select(columns)
        .leftJoin(joinClause[0], joinClause[1], joinClause[2]))
});

export const bySubdomain = async((subdomain: string): Concierge.Container => {
    return await(
        db('Containers')
            .select(columns)
            .where({ subdomain })
            .leftJoin(joinClause[0], joinClause[1], joinClause[2])
            .limit(1)
    )[0];
})

const columns = [
    'Containers.*',
    'Applications.name as applicationName'
];

const joinClause = [
    'Applications',
    'Applications.id',
    'Containers.applicationId'
]