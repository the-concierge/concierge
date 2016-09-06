import * as React from 'react';

const Sidebar = (props: { width: number } = { width: 200 }) => (
    <div style={{
        width: props.width,
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#666',
    }}>
    </div>
)

export default Sidebar