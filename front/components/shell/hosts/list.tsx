import * as React from 'react';
import { connect } from 'react-redux';
import Table from '../../table/index';
import Head from '../../table/head';
import Row from '../../table/row';
import Anchor from '../../anchor';
import { backgroundColor } from '../../common';

const render = ({ hosts }: AppState) => (
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

const mapStateToProps = (state: AppState) => {
    return state;
}

const HostList = connect(
    mapStateToProps
)(render);

export default HostList;

const toHostRow = (host: Concierge.APIHost, index: number) => (
    <Row columns={toColumns(host)} rowStyles={rowStyle} key={index} />
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
}

const rowStyle = {
}

const anchorStyle = {
    anchor: {
        color: backgroundColor
    }
};
