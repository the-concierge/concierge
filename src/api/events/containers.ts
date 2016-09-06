import { server as socket } from './server';
import db from '../../data/connection';
import * as getContainers from '../containers/get';
import getLog from '../containers/getLogStream';
import getStats from '../containers/getStatsStream';
import * as log from '../../logger';
import * as emitter from './emitter';
import getConfig from '../configurations/get';
import heartbeat from '../containers/heartbeat';
import * as analysis from 'analysis';

// TODO: notWatching should be monitored and actively retried
// TODO: Look for new containers and attempt to watch

var binFrequency = 0; // Milliseconds ?
var binSize = 0;
var binTrimTime = 0;
var timer: NodeJS.Timer;

type Stats = {
    container: Concierge.Container;
    events: boolean;
    stats: boolean;
    memory: number[];
    cpu: number[];
}

const containerStates: { [containerId: number]: Stats } = {}

export default function watchAll() {
    const config = getConfig();
    binFrequency = config.heartbeatFrequency;
    binSize = config.heartbeatBinSize;
    binTrimTime = binFrequency * binSize;

    var monitorAll = (containers: Concierge.Container[]) => containers.forEach(watchContainer);

    if (!timer) timer = setTimeout(() => flush(), binFrequency);

    return getContainers.all()
        .then(monitorAll)
        .catch(err => log.error(`[MONITOR] Heartbeat failed: ${err.stack || err}`));
}

/**
 * Destructive
 */
export function watchContainer(container: Concierge.Container) {
    let state = containerStates[container.id];
    if (!state) {
        state = {
            container,
            events: false,
            stats: false,
            cpu: [],
            memory: []
        }
        containerStates[container.id] = state;
    }
    if (!state.events) {
        watchEvents(container.id)

    }

    if (!state.stats) {
        watchStats(container.id);
    }
}

function watchEvents(containerId: number) {
    const state = containerStates[containerId];
    function callback(error: any, event: string) {
        if (error) {
            state.events = false;
        }
        emitter.container(state.container.subdomain, event);
        state.events = true;
    }

    getLog(state.container, callback);

}

/**
 * Destructive
 * Potential source of memory leaks
 * Stats are kept until the the bin is 'flushed' (every binFrequency [in milliseconds]) then emptied
 * 
 * Create, listen and parse a statistics stream for a Container
 */
function watchStats(containerId: number) {
    const container = containerStates[containerId].container;

    // No need to do anything if it is already being watched
    if (containerStates[containerId].events) return;

    log.debug(`Watching ${container.subdomain}`);
    let previousStats: any = null;

    function onDataCallback(error, stats) {
        const state = containerStates[containerId];
        if (error) {
            state.stats = false;
            return;
        }
        var memoryUsagePercentage = getMemoryUsage(stats);
        state.memory.push(memoryUsagePercentage);

        // We cannot calculate CPU usage without more than one sample
        // CPU usage is based on change
        if (!previousStats) {
            previousStats = stats;
            emitter.containerStats(container.subdomain, usageEvent(memoryUsagePercentage));
            return;
        }

        var cpuUsagePercentage = getCpuUsage(previousStats, stats);
        emitter.containerStats(container.subdomain, usageEvent(memoryUsagePercentage, cpuUsagePercentage));
        state.cpu.push(cpuUsagePercentage);
        previousStats = stats;
    }

    function onEndCallback() {
        log.warn(`[MONITOR] Events stream to [${container.dockerId.slice(0, 10)}] ${container.label} has stopped`);
        containerStates[containerId].events = false;
    }

    // Start listening to the stats stream
    getStats(container, onDataCallback, onEndCallback);
    containerStates[containerId].stats = true;

}

function usageEvent(memory: number, cpu?: number) {
    return {
        memory: analysis.common.round(memory, 2) + '%',
        cpu: (cpu || 0) + '%'
    };
}


const flush = async(() => {
    clearTimeout(timer);
    timer = null;

    // We need to remove dead containers from our watch list
    const containers = await(getContainers.all());
    const exists = (key: number) => containers.some(container => Number(container.id) === key)
    const removedContainers = Object.keys(containerStates)
        .filter(key => !exists(Number(key)));
    removedContainers.forEach(key => {
        log.debug(`Unwatch ${containerStates[Number(key)].container.subdomain}`);
        delete containerStates[key];
    });

    // Write the stats to the database
    // Remove stats and heartbeats older than binTrimTime

    const trx = await(db.getTransaction());
    try {
        const identifiers = Object.keys(containerStates);

        identifiers.forEach(id => {
            const state = containerStates[Number(id)];
            const stats = toStats(state);
            const responseTime = await(heartbeat(state.container));
            stats.responseTime = responseTime;
            const heartbeatId = await(insertHeartbeat(stats).transacting(trx));
            await(truncateHeartbeats().transacting(trx));
            delete state.cpu;
            delete state.memory;
            state.cpu = [];
            state.memory = [];
        });

        await(trx.commit());
    }
    catch (ex) {
        await(trx.rollback());
    }
    finally {
        process.nextTick(() => watchAll());
    }
});

function toStats(state: Stats) {
    var cpu = analysis.descriptive.box(state.cpu.slice());
    var memory = analysis.descriptive.box(state.memory.slice());

    cpu.mean = analysis.common.round(cpu.mean, 2);
    memory.mean = analysis.common.round(memory.mean, 2);
    cpu.range.difference = analysis.common.round(cpu.range.difference, 2);
    memory.range.difference = analysis.common.round(memory.range.difference, 2);

    var stats = {
        containerId: state.container.id,
        cpu: JSON.stringify(cpu),
        memory: JSON.stringify(memory),
        responseTime: 0,
        timestamp: Date.now()
    };
    return stats;
}

function insertHeartbeat(stats) {
    return db('Heartbeats')
        .insert(stats)
}

function truncateHeartbeats() {
    var cutOff = Date.now() - binTrimTime;
    return db('Heartbeats')
        .delete()
        .where('timestamp', '<', cutOff)
}

function getCpuUsage(start: any, end: any) {
    var x = end.cpu_stats.cpu_usage.total_usage - start.cpu_stats.cpu_usage.total_usage;
    var y = end.cpu_stats.system_cpu_usage - start.cpu_stats.system_cpu_usage;
    var percentage = (x / (x + y)) * 100;

    return analysis.common.round(percentage, 2);
}

function getMemoryUsage(stats: any) {
    var current = stats.memory_stats.usage / 1024 / 1024;
    var limit = stats.memory_stats.limit / 1024 / 1024;

    var percentage = analysis.common.round((current / limit) * 100, 2);

    return analysis.common.round(percentage, 2);
}
