import * as React from 'react';

const Sidebar = (props: { width: number } = { width: 200 }) => (
    <div style={{
        width: props.width,
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#303030',
    }}>
    </div>
)

export default Sidebar