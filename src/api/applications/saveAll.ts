import db from '../../data/connection';
import * as log from '../../logger';
import clone from './clone';
import deleteRepository from './deleteRepo';

/**
 * TODO: Can this behaviour be generic? ... Yes, but how to do it cleanly?
 */

export default async((request: Concierge.SaveRequest<Concierge.Application>) => {
    const trx = await(db.getTransaction());

    try {
        const inserts = await(doInserts(trx, request.inserts));
        const updates = await(doUpdates(trx, request.updates));
        const deletes = await(doDeletes(trx, request.deletes));
        await(trx.commit());
        return true;
    }
    catch (ex) {
        await(trx.rollback());
        throw ex;
    }
});

const doInserts = async((trx: any, models: Concierge.Application[]) => {    
    return models.map(model => {
        delete model.id;
        const id: number[] = await(db('Applications').insert(model).transacting(trx));
        model.id = id[0];
        try {
            const cloneResult = await(clone(model));
            return cloneResult;
        }
        catch (ex) {
            throw ex;
        }
    })
});

const doUpdates = async((trx: any, models: Concierge.Application[]) => {
    const results = models.map(model => {
        const original: Concierge.Application = await(get(trx, model.id));
        const isRepoChanged = original.gitRepository !== model.gitRepository;

        const result = await(db('Applications')
            .update(model)
            .where('id', model.id)
            .transacting(trx));
        
        // The model from the request may not have private key/tokens if they haven't changed.
        const updatedModel = await(get(trx, model.id));
        if (isRepoChanged) {
            await(deleteRepository(model));
            await(clone(updatedModel));
        }

        return result;
    });
    return results;

});

const doDeletes = async((trx: any, models: Concierge.Application[]) => {
    const results = models.map(model => {
        await(
            db('Applications')
                .delete()
                .where('id', model.id)
                .transacting(trx)
            )
        await(deleteRepository(model));
    });
    return results;
});

const get = async((trx: any, id: number) => {
    const app: Concierge.Application = await(
        db('Applications')
            .select()
            .where('id', id)
            .transacting(trx)

    )[0];
    return app;
});