import * as React from 'react';

export default ({ children }: { children?: any }) => (
    <div style={{ display: 'flex', overflow: 'auto', flex: 1, justifyContent: 'flex-start' }}>
        {children}
    </div>
)