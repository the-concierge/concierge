import * as React from 'react';

/**
 * TODO: Use Dashboard as default content
 */
export default ({ children }: { children?: any }) => (
    <div style={{ width: '100%', margin: 10 }}>
        {children || <div>...</div>}
    </div>
)