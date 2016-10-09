import * as React from 'react';

export default ({ host }: { host: Concierge.APIHost }) => (
    <div>
        <div style={{ display: 'inline-block' }}>
            {host.id}
        </div>
        <div style={{ display: 'inline-block' }}>
            {host.hostname}
        </div>
        <div style={{ display: 'inline-block' }}>
            {host.ip}
        </div>
        <div style={{ display: 'inline-block' }}>
            {host.dockerVersion}
        </div>
        <div style={{ display: 'inline-block' }}>
            {host.containerCount}
        </div>
    </div>
)