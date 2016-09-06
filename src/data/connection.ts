import knex = require('knex');

const connection = knex({
    client: 'sqlite3',
    connection: {
        filename: "./db/concierge.db"
    },
    useNullAsDefault: true
} as any);
 
function getTransaction(): Promise<knex.Transaction> {
    const promise = new Promise<knex.Transaction>(resolve => {
        connection.transaction(trx => resolve(trx));
    });
    return promise;
}

connection['getTransaction'] = getTransaction;

export default connection as knex & { getTransaction: typeof getTransaction } ; 
