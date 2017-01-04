import db from '../../data/connection';
import * as log from '../../logger';

export default async function saveAll(request: Concierge.SaveRequest<Concierge.Container>) {
    const trx = await db.getTransaction();
    try {
        const updates = request.updates.map(stripProps);

        for (const update of updates) {
             const query = doUpdates(update);
             await query.transacting(trx);
        }

        await trx.commit();
    }
    catch (ex) {
        await trx.rollback();
        throw ex;
    }
}

function doUpdates(container: any) {
    return db('Containers')
        .update(container)
        .where('id', container.id);
}

function stripProps(container: Concierge.Container) {
    return {
        id: container.id,
        label: container.label,
        isProxying: container.isProxying,
        subdomain: container.subdomain
    }
}