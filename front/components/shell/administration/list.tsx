import * as React from 'react';
import { connect } from 'react-redux';
import Table from '../../table/index';
import Head from '../../vert-table/head';
import Cell from '../../vert-table/cell';
import Anchor from '../../anchor';
import { backgroundColor } from '../../common';

const render = ({ configurations }: AppState) => (
    <div>
        <Table>
            <tbody>
                {headings.map((heading, index) => toContainerColumns(heading[1], configurations, index))}
            </tbody>
        </Table>
    </div>
);

const mapStateToProps = (state: AppState) => {
    return state;
}

const ConfigurationList = connect(mapStateToProps)(render);
export default ConfigurationList;

const toContainerColumns = (prop: keyof Concierge.Configuration, configs: Concierge.Configuration[], index: number) => {
    const head = headings.find(heading => heading[1] === prop);
    const columns = configs.map(cfg => cfg[prop]);
    return (
        <tr key={index}>
            <Head heading={head[0]} rowStyles={{ th: { 'min-width': '300px', 'font-size': '1em' } }} />
            {configs.map((cfg, index) => <Cell text={cfg[prop]} key={index} columnStyles={{ td: { width: '100%' } }} />)}
        </tr>
    )
}

const headings: Array<[string, keyof Concierge.Configuration]> = [
    ['Name', 'name'],
    ['UI Port', 'conciergePort'],
    ['Proxy: Hostname', 'proxyHostname'],
    ['Proxy: IP', 'proxyIp'],
    ['Proxy: HTTP Port', 'httpPort'],
    ['Proxy: HTTPS Port', 'httpsPort'],
    ['Proxy: Use HTTPS', 'useHttps'],
    ['LetsEncrypt: Use Production Certs', 'useProductionCertificates'],
    ['LetsEncrypt: Certificate Email', 'certificateEmail'],
    ['Concierge: Debug Logging', 'debug'],
    ['Container: Min Update', 'containerMinimumUptime'],
    ['Container: Max Retries', 'containerMaximumRetries'],
    ['Container: Heartbeat Frequency (MS)', 'heartbeatFrequency'],
    ['Container: Heartbeat Bin Size (Samples)', 'heartbeatBinSize'],
    ['Docker: Registry IP:Port', 'dockerRegistry'],
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
