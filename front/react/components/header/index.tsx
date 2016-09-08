import * as React from 'react';
import NavItem from './nav-item';
import Brand from './brand';

export default ({height}: { height: number }) => (
    <div style={getStyles({height})}>
        <Brand brandName={"Concierge"}/>
        {navItems.map(([text, href], key) => <NavItem text={text} href={href} key={key} />)}
    </div>
)

const getStyles = ({height}: { height: number }): React.CSSProperties => ({
    height,
    backgroundColor: '#02578d',
    display: 'flex',
    alignItems: 'center',
})

const navItems = [
    ['Hosts', '/react/hosts'],
    ['Containers', '/react/containers'],
    ['Images', '/react/images'],
    ['Applications', '/applications'],
    ['Administration', '/admin'],
    ['Archive', '/archive']
]