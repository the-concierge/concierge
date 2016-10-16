import db from '../../data/connection';
import makeDirectory from '../ssh/makeDirectory';
import readDirectory from '../ssh/readDirectory';

export default async((request: Concierge.SaveRequest<Concierge.Host>) => {
    const trx = await(db.getTransaction());
    try {
        await(doInserts(trx, request.inserts));
        await(doUpdates(trx, request.updates));
        await(trx.commit());
        return true;
    }
    catch (error) {
        await(trx.rollback());
        throw error;
    }    
})

const doInserts = async((trx: any, models: Concierge.Host[]) => {
    const createdVolumePaths = await(createVolumePaths(models));
    return models.map(model => {
        delete model.id;
        return await(db('Hosts')
            .insert(model)
            .transacting(trx));
    });
});

const doUpdates = async((trx: any, models: Concierge.Host[]) => {
    if (models.length === 0) return [];
    return models.map(model => {
        return await(db('Hosts')
            .update(model)
            .where({ id: model.id })
            .transacting(trx));
    });

});

const createVolumePaths = async((hosts: Concierge.Host[]) => {
    const volumesCreated = hosts.map(host => {
        const aleadyExists = await(readDirectory(host, ''));
        if (aleadyExists) return true;

        try {
            const isCreated = await(makeDirectory(host, ''));
            log.info(`Created volume path for ${host.hostname}`);
            return true;
        }
        catch (ex) {
            log.error(`Failed to create volume path for ${host.hostname}: ${ex.message}`);
            return false;
        }

    });

    return volumesCreated.every(result => result === true);
});