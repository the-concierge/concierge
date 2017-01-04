import db from '../../data/connection';
import { setCache } from './get';
import { ActiveState } from '../../types/states';
import updateWebServers from '../../proxy';

export default async function saveAll(request: Concierge.SaveRequest<Concierge.Configuration>) {
    const trx = await (db.getTransaction());
    try {
        const table = 'Configurations';

        for (const update of request.updates) {
            await db(table)
                .update(update)
                .where('id', update.id)
                .transacting(trx);
        }

        for (const req of request.inserts) {
            await db(table)
                .insert(req)
                .transacting(trx);
        }

        await trx.commit();

        const activeConfig: Concierge.Configuration = await db(table)
            .select()
            .where('isActive', ActiveState.Active)
            .first();

        if (activeConfig) {
            setCache(activeConfig);
        }

        await updateWebServers();
        return true;
    }
    catch (ex) {
        await trx.rollback();
        throw ex;
    }
}