import * as React from 'react';
import Anchor from '../anchor';

const NavItem = (props: { text: string, href: string }) => (
    <div style={headerStyle}>
        <Anchor href={props.href} text={props.text} />
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