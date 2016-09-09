import * as React from 'react';
import NavItem from './nav-item';
import Brand from './brand';

export default ({items}: { items: Array<{name: string, href: string}> }) => (
    <div style={styles}>
        <Brand brandName={"Concierge"}/>
        {items.map(({name, href}, key) => <NavItem text={name} href={href} key={key} />)}
    </div>
)

const styles: React.CSSProperties = {
    height: 48,
    backgroundColor: '#02578d',
    display: 'flex',
    alignItems: 'center',
}