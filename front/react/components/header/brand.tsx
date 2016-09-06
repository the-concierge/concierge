import * as React from 'react';

export default (props: { brandName: string}) => (
    <div style={{
        fontSize: '1.4em',
        textShadow: '1px 1px 1px rgba(0, 0, 0, 0, 3)',
        color: '#ccc'
    }}>
        {props.brandName}
    </div>
)