import * as React from 'react';
import NavItem from './nav-item';
import Brand from './brand';
const Header = ({height}: { height: number }) => (
    <div style={getStyles({height})}>
        <Brand brandName={"Concierge"}/>
        {navItems.map(([text, href], key) => <NavItem text={text} href={''} key={key} />)}
    </div>
)

const getStyles = ({height}: { height: number }): React.CSSProperties => ({
    height,
    backgroundColor: '#02578d',
    display: 'flex',
    alignItems: 'center',
})

const navItems = [
    ['Hosts', '/hosts'],
    ['Containers', '/containers'],
    ['Images', '/images'],
    ['Applications', '/applications'],
    ['Administration', '/admin'],
    ['Archive', '/archive']
]

export default Header;