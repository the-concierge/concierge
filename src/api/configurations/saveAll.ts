import db from '../../data/connection';
import { setCache } from './get';
import { ActiveState } from '../../types/states';
import updateWebServers from '../../proxy';

export default async((request: Lists.SaveRequest) => {
    const trx = await(db.getTransaction());
    try {
        const table = 'Configurations';

        request.updates.forEach(req => await(
            db(table).update(req).where('id', req.id).transacting(trx)
        ));

        request.inserts.forEach(req => await(
            db(table).insert(req).transacting(trx)
        ));


        await(trx.commit());

        const activeConfig: Concierge.Configuration = await(
            db(table).select().where('isActive', ActiveState.Active)
        )[0];

        if (activeConfig) {
            setCache(activeConfig);
        }

        await(updateWebServers());
        return true;
    }
    catch (ex) {
        await(trx.rollback());
        throw ex;
    }
});