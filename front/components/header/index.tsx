import * as React from 'react';
import NavItem from './nav-item';
import Brand from './brand';

export default ({items}: { items: Array<{text: string, href: string}> }) => (
    <div style={styles}>
        <Brand brandName={"Concierge"}/>
        {items.map(({text, href}, key) => <NavItem text={text} href={href} key={key} />)}
    </div>
)

const styles: React.CSSProperties = {
    height: 48,
    backgroundColor: '#02578d',
    display: 'flex',
    alignItems: 'center',
}