import * as React from 'react';

const headerStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '1.2em',
    fontWeight: 'bold',
    paddingLeft: '20px',
    height: '20px',
    display: 'block'
}

const NavItem = (props: { name: string, href: string }) => (
    <div style={headerStyle}>
        <a href={props.href}>
            {props.name}
        </a>
    </div>
)

export default NavItem