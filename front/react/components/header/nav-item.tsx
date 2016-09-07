import * as React from 'react';
import Anchor from '../anchor';

const NavItem = ({text, href}: { text: string, href: string }) => (
    <div style={headerStyle}>
        <Anchor href={href} text={text} />
    </div>
)

const headerStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1.2em',
    paddingRight: '20px',
    height: '20px',
    display: 'block'
}

export default NavItem