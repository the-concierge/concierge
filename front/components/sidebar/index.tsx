import * as React from 'react';
import Anchor from '../anchor';

export default ({options}: {options: Array<{ text: string, href: string }>}) => (
    <div style={styles}>
        {options.map(({text, href}) => <p><Anchor text={text} href={href} /></p>)}
    </div>
)

const styles: React.CSSProperties = {
    padding: 10,
    minWidth: 200,
    float: 'left', 
    backgroundColor: '#303030',
    color: '#fff'
}