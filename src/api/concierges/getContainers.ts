import * as getConcierges from './get';
import * as request from '../request';

/**
 * Fetch one or all containers from a remote Concierge
 */
export const one = async((conciergeId: number | Concierge.Concierge) => {
    if (isNum(conciergeId)) {
        let concierge = await(getConcierges.one(conciergeId));
        return await(request.get(toUrl(concierge)));
    } else {
        return await(request.get(toUrl(conciergeId)));
    }
});

function isNum(value): value is number {
    return typeof value === 'number';
}

export const all = async(() => {
    const concierges = await(getConcierges.all());
    const containerLists = concierges.map(concierge => await(request.get(toUrl(concierge))));
    const results = containerLists.map(result => JSON.parse(result) as Concierge.Container[]);
    return [].concat(results) as Concierge.Container[];
});

function toUrl(concierge: Concierge.Concierge) {
    let url = `http://${concierge.hostname}:${concierge.port}/containers`;
    return url;
}