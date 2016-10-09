import * as React from 'react';
import Single from './single';

// TODO: Simplify--remove duplicate code
export default ({ hosts }: AppState) => (
    <div>
        {hosts.map(host => (
            <div key={host.id}>
                <Single host={host} />
            </div>
        ))}
    </div>
)