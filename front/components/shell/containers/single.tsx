import * as React from 'react';
import Block from '../../block';
import Anchor from '../../anchor';

export default ({ container }: { container: Concierge.APIContainer }) => (
    <div>
        <Block children={container.id} />
        <Block>
            <Anchor href={`http://${container.host}:{container.port}`}>
                {container.host}:{container.port}
            </Anchor>
        </Block>
        <Block children={container.applicationName} />
        <Block children={container.dockerImage} />
        <Block children={container.isProxying} />
        
    </div>
)