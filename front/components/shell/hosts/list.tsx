import * as React from 'react';
import Table from '../../table/index';
import Head from '../../table/head';
import Row from '../../table/row';
import Anchor from '../../anchor';
import { backgroundColor } from '../../common';

export default ({ hosts }: AppState) => (
    <div>
        <Table>
            <thead>
                <Head headings={headings} rowStyles={headStyle} />
            </thead>
            <tbody>
                {hosts.map(toHostRow)}
            </tbody>
        </Table>
    </div>
);

const toHostRow = (host: Concierge.APIHost) => (
    <Row columns={toColumns(host)} rowStyles={rowStyle} />
)

const toColumns = (host: Concierge.APIHost) => [
    host.id,
    host.hostname,
    host.dockerPort,
    host.capacity,
    host.containerCount || 0,
    host.dockerVersion || 'Unknown'
]

const headings = [
    'Id',
    'Hostname',
    'Docker Port',
    'Capacity',
    '# Containers',
    'Docker Version'
];

const headStyle = {
    tr: {
        height: '45px'
    }
}

const rowStyle = {
    tr: {
        height: '35px'
    }
}

const anchorStyle = {
    anchor: {
        color: backgroundColor
    }
};
