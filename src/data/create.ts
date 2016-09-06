import * as knex from 'knex';
import db from './connection';

/**
 * Create the database schema
 */
export default async(() => {

    const funcs = [
        configurationTable,
        applicationTable,
        hostTable,
        variantTable,
        containerTable,
        conciergeTable,
        heartbeatTable
    ];

    funcs.forEach(fn => {
        fn;
        const tbl = fn();
        await(tbl);
    });
    return true;
});

function configurationTable() {
    return db.schema.createTable('Configurations', tbl => {
        tbl.increments('id').primary();
        tbl.text('name').unique();
        tbl.integer('conciergePort').defaultTo(3141);
        tbl.text('proxyHostname').defaultTo('localhost');
        tbl.text('proxyIp').defaultTo('0.0.0.0');
        tbl.text('subdomainBlacklist').defaultTo('');
        tbl.integer('httpPort').defaultTo(5926);
        tbl.integer('httpsPort').defaultTo(5358);
        tbl.integer('useHttps').defaultTo(0);
        tbl.integer('useProductionCertificates').defaultTo(0);
        tbl.integer('debug').defaultTo(1);
        tbl.integer('containerMinimumUptime').defaultTo(2000);
        tbl.integer('containerMaximumRetries').defaultTo(3);
        tbl.integer('heartbeatFrequency').defaultTo(60000);
        tbl.integer('heartbeatBinSize').defaultTo(1440);
        tbl.integer('isActive').defaultTo(1);
        tbl.text('dockerRegistry').defaultTo('http://0.0.0.0:5000');
    });
}

function applicationTable() {
    return db.schema.createTable('Applications', tbl => {
        tbl.increments('id').primary();
        tbl.text('name').unique();
        tbl.text('gitApiType').defaultTo('github');
        tbl.text('gitRepository').notNullable();
        tbl.text('gitPrivateToken').defaultTo('');
        tbl.text('gitPrivateKey').defaultTo('');
        tbl.text('dockerNamespace').defaultTo('namespace/repository');
        tbl.text('variables').defaultTo('[]');
    });
}

function hostTable() {
    return db.schema.createTable('Hosts', tbl => {
        tbl.increments('id').primary();
        tbl.text('hostname').unique();
        tbl.integer('capacity').defaultTo(5);
        tbl.integer('dockerPort').defaultTo(2375);
        tbl.text('sshUsername').notNullable();
        tbl.integer('sshPort').defaultTo(22);
        tbl.text('privateKey').defaultTo('***');
    });
}

function variantTable() {
    return db.schema.createTable('Variants', tbl => {
        tbl.increments('id').primary();
        tbl.text('name').unique();
        tbl.text('buildState').notNullable();
        tbl.integer('buildTime').notNullable();
        tbl.integer('application').notNullable();
    });
}

function containerTable() {
    return db.schema.createTable('Containers', tbl => {
        tbl.increments('id').primary();
        tbl.integer('port').defaultTo(0);
        tbl.text('variant').notNullable();
        tbl.text('subdomain').notNullable();
        tbl.text('label').notNullable();
        tbl.integer('isProxying').defaultTo(0);
        tbl.text('dockerId').notNullable();
        tbl.text('host').notNullable();
        tbl.text('variables').defaultTo('[]');
        tbl.text('dockerImage').notNullable();
        tbl.integer('applicationId').notNullable();
    });
}

function conciergeTable() {
    return db.schema.createTable('Concierges', tbl => {
        tbl.increments('id').primary();
        tbl.text('label').unique().notNullable();
        tbl.text('hostname').notNullable();
        tbl.integer('port').defaultTo(3141);
    });
}

function heartbeatTable() {
    return db.schema.createTable('Heartbeats', tbl => {
        tbl.integer('containerId').notNullable();
        tbl.text('cpu').notNullable();
        tbl.text('memory').notNullable();
        tbl.integer('responseTime').notNullable();
        tbl.increments('timestamp').notNullable();
    });
}