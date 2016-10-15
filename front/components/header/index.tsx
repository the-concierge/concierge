import * as React from 'react';
import NavItem from './nav-item';
import Brand from './brand';
import { backgroundColor } from '../common';

export default ({items}: { items: Array<{ text: string, href: string }> }) => (
    <div style={styles}>
        <Brand brandName={"Concierge"} />
        {items.map(({text, href}, key) => <NavItem text={text} href={href} key={key} />)}
    </div>
)

const styles: React.CSSProperties = {
    backgroundColor,
    height: 48,
    display: 'flex',
    alignItems: 'center',
}