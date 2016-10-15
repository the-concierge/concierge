import * as React from 'react';
import { connect } from 'react-redux';
import Table from '../../table/index';
import Head from '../../table/head';
import Row from '../../table/row';
import Anchor from '../../anchor';
import { backgroundColor } from '../../common';

const render = ({ containers }: AppState) => (
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

const mapStateToProps = (state: AppState) => {
    return state;
}

const ContainerList = connect(mapStateToProps)(render);
export default ContainerList;

const toContainerRow = (container: Concierge.APIContainer, index: number) => (
    <Row columns={toContainerColumns(container)} rowStyles={rowStyle} key={index} />
)

const toContainerColumns = (container: Concierge.APIContainer) => [
    container.id,
    container.label,
    container.subdomain,
    container.memory || '???',
    container.cpu || '???',
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
    'Memory',
    'CPU',
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

}

const anchorStyle = {
    anchor: {
        color: backgroundColor
    }
};
