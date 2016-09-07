import * as React from 'react';

export default ({brandName}: { brandName: string }) => (
    <div style={styles}>
        <span style={{ marginLeft: 10 }}>{brandName}</span>
    </div>
)

const styles = {
    width: 200,
    fontSize: '1.4em',
    textShadow: '1px 1px 1px rgba(0, 0, 0, 0, 3)',
    color: '#ccc'
}