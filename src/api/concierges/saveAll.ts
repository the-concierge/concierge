import db from '../../data/connection';
import * as log from '../../logger';

export default async function saveAll(request: Concierge.SaveRequest<Concierge.Concierge>) {
    return db.transaction(trx => {
        doInserts(trx, request.inserts)
            .then(() => doUpdates(trx, request.updates))
            .then(trx.commit)
            .catch(error => {
                trx.rollback();
                throw error;
            });
    });
}

async function doInserts(trx: any, models: any[]) {
    const isAllValid = models.every(isValidConcierge);
    if (!isAllValid) return Promise.reject('Unable to insert Concierge: Required fields missing');
    for (const model of models) {
        delete model.id;
        await db('Concierges')
            .insert(model)
            .transacting(trx)
    }
}

async function doUpdates(trx: any, models: any[]) {
    for (const model of models) {
        await db('Concierges')
            .update(model)
            .where({ id: model.id })
            .transacting(trx)
    }
}

function isValidConcierge(concierge: Concierge.Concierge): boolean {
    concierge.label = concierge.label || '';
    var isValidLabel = concierge.label.length > 0;

    concierge.port = concierge.port || 0;
    var isValidPort = concierge.port > 0 && concierge.port < 65535;

    concierge.hostname = concierge.hostname || '';
    var isValidHostname = concierge.hostname.length > 0;

    return isValidLabel && isValidPort && isValidHostname;
}