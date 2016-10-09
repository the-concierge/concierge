import * as React from 'react';
import Block from '../../block';

export default ({ container }: { container: Concierge.APIContainer }) => (
    <div>
        <Block text={container.id} />
        <Block text={container.host} />
        <Block text={container.applicationName} />
        <Block text={container.dockerImage} />
        <Block text={container.isProxying} />
        <Block text={container.port} />
    </div>
)