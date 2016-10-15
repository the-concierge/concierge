import * as React from 'react';
import Block from '../../block';

export default ({ host }: { host: Concierge.APIHost }) => (
    <div>
        <Block children={host.id} />
        <Block children={host.hostname} />
        <Block children={host.ip} />
        <Block children={host.dockerVersion} />
        <Block children={host.containerCount} />
    </div>
)