import * as React from 'react';
import Table from '../../table/index';
import Head from '../../table/head';
import Row from '../../table/row';
import Anchor from '../../anchor';
import { backgroundColor } from '../../common';

export default ({ containers }: AppState) => (
    <div>
        <Table>
            <thead>
                <Head headings={headings} rowStyles={headStyle} />
            </thead>
            <tbody>
                {containers.map(toContainerRow)}
            </tbody>
        </Table>
    </div>
);

const toContainerRow = (container: Concierge.APIContainer) => (
    <Row columns={toContainerColumns(container)} rowStyles={rowStyle} />
)

const toContainerColumns = (container: Concierge.APIContainer) => [
    container.id,
    container.label,
    container.subdomain,
    <Anchor href={`http://${container.host}:{container.port}`} styles={anchorStyle}>
        {container.host}:{container.port}
    </Anchor>,
    container.applicationName,
    container.dockerImage,
    container.isProxying ? 'Yes' : 'No'
]

const headings = [
    'Id',
    'Label',
    'Subdomain',
    'Location',
    'Application',
    'Docker Image',
    'Proxying'
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
