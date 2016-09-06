import db from '../../data/connection';

export const one = async((variantName: string): Concierge.Variant => {
    let query = await(db('Variants')
        .select(
        'Variants.name',
        'Applications.name as application',
        'buildState',
        'buildTime'
        )
        .where('Variants.name', variantName.toLocaleLowerCase())
        .innerJoin('Applications', 'Applications.id', 'Variants.application'));
    return query[0];
});

export const all = async((): Concierge.Variant[] => {
    const variants = await(db('Variants')
        .select(
        'Variants.name',
        'Applications.name as application',
        'buildState',
        'buildTime'
        )
        .innerJoin('Applications', 'Applications.id', 'Variants.application'));

    return variants;
});