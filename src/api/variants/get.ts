import db from '../../data/connection';

export async function one(variantName: string): Promise<Concierge.Variant> {
    const variant = await db('Variants')
        .select(
        'Variants.name',
        'Applications.name as application',
        'buildState',
        'buildTime'
        )
        .where('Variants.name', variantName.toLocaleLowerCase())
        .innerJoin('Applications', 'Applications.id', 'Variants.application')
        .first();
    return variant;
}

export async function all(): Promise<Concierge.Variant[]> {
    const variants = await db('Variants')
        .select(
        'Variants.name',
        'Applications.name as application',
        'buildState',
        'buildTime'
        )
        .innerJoin('Applications', 'Applications.id', 'Variants.application');
    return variants;
}