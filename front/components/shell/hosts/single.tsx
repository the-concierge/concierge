import * as React from 'react';
import Block from '../../block';

export default ({ host }: { host: Concierge.APIHost }) => (
    <div>
        <Block text={host.id} />
        <Block text={host.hostname} />
        <Block text={host.ip} />
        <Block text={host.dockerVersion} />
        <Block text={host.containerCount} />
    </div>
)