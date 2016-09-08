import * as React from 'react';

/**
 * TODO: Use Dashboard as default content
 */
export default ({ content }: { content: () => JSX.Element }) => (
    <div style={{ width: '100%', margin: 10 }}>
        {content || <div>NoContent!</div>}
    </div>
)