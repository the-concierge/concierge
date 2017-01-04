import db from '../../data/connection';
import * as log from '../../logger';
import clone from './clone';
import deleteRepository from './deleteRepo';

/**
 * TODO: Can this behaviour be generic? ... Yes, but how to do it cleanly?
 */

export default async function saveAll(request: Concierge.SaveRequest<Concierge.Application>) {
    const trx = await db.getTransaction();

    try {
        const inserts = await doInserts(trx, request.inserts);
        const updates = await doUpdates(trx, request.updates);
        const deletes = await doDeletes(trx, request.deletes);
        await trx.commit();
        return true;
    }
    catch (ex) {
        await trx.rollback();
        throw ex;
    }
}

async function doInserts(trx: any, models: Concierge.Application[]) {
    for (const model of models) {
        delete model.id;
        const id: number[] = await db('Applications')
            .insert(model)
            .transacting(trx);
        model.id = id[0];

        try {
            await clone(model);
        }
        catch (ex) {
            throw ex;
        }
    }
}

async function doUpdates(trx: any, models: Concierge.Application[]) {
    for (const model of models) {
        const original: Concierge.Application = await get(trx, model.id);
        const isRepoChanged = original.gitRepository !== model.gitRepository;

        const result = await db('Applications')
            .update(model)
            .where('id', model.id)
            .transacting(trx);

        // The model from the request may not have private key/tokens if they haven't changed.
        const updatedModel = await get(trx, model.id);
        if (!isRepoChanged) {
            continue;
        }
        await deleteRepository(model);
        await clone(updatedModel);
    }
}

async function doDeletes(trx: any, models: Concierge.Application[]) {
    for (const model of models) {
        await db('Applications')
            .delete()
            .where('id', model.id)
            .transacting(trx);
        await deleteRepository(model);
    }
}

async function get(trx: any, id: number) {
    const app: Concierge.Application = await db('Applications')
        .select()
        .where('id', id)
        .transacting(trx)[0];
    return app;
}