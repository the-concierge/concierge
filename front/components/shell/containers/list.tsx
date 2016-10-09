import * as React from 'react';
import Single from './single';

// TODO: Simplify--remove duplicate code
export default ({ containers }: AppState) => (
    <div>
        {containers.map(container => (
            <div key={container.id}>
                <Single container={container} />
            </div>
        ))}
    </div>
)