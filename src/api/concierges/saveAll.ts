import db from '../../data/connection';
import * as log from '../../logger';

export default async((request: Lists.SaveRequest) => {
    return db.transaction(trx => {
        doInserts(trx, request.inserts)
            .then(() => doUpdates(trx, request.updates))
            .then(trx.commit)
            .catch(error => {
                trx.rollback();
                return Promise.reject(error);
            })
    });
});

const doInserts = async((trx: any, models: any[]) => {
    const isAllValid = models.every(isValidConcierge);
    if (!isAllValid) return Promise.reject('Unable to insert Concierge: Required fields missing');
    const results = models.map(model => {
        delete model.id;
        return await(
            db('Concierges')
                .insert(model)
                .transacting(trx)
        );
    });
    return results;
});

const doUpdates = async((trx: any, models: any[]) => {
    const results = models.map(model => {
        return db('Concierges')
            .update(model)
            .where({ id: model.id})
            .transacting(trx)
    });
    return results;
});

function isValidConcierge(concierge: Concierge.Concierge): boolean {
    concierge.label = concierge.label || '';
    var isValidLabel = concierge.label.length > 0;

    concierge.port = concierge.port || 0;
    var isValidPort = concierge.port > 0 && concierge.port < 65535;

    concierge.hostname = concierge.hostname || '';
    var isValidHostname = concierge.hostname.length > 0;

    return isValidLabel && isValidPort && isValidHostname;
}