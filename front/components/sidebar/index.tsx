import * as React from 'react';

export default ({content}: {content: () => JSX.Element}) => (
    <div style={styles}>
        {content || <div>No Options!</div>}
    </div>
)

const styles: React.CSSProperties = {
    padding: 10,
    minWidth: 200,
    float: 'left', 
    backgroundColor: '#303030',
    color: '#fff'
}