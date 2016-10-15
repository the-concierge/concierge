import * as React from 'react';

export default ({ text, children }: { text?: string | number, children?: any }) => (
    <div style={styles}>
        {text || children || 'N/A'}
    </div>
)

const styles: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#9BF0FF',
    marginRight: '2px',
    padding: '10px',
    paddingLeft: '15px',
    paddingRight: '15px'
}