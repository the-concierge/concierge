import * as React from 'react';
import * as DOM from 'react-dom';
import Header from '../header/index';
import Sidebar from '../sidebar/index';

const Concierge = () => (
    <div style={styles}>
        <Header height={60} />
        <Sidebar width={200} />
    </div>
)

export function render() {
    DOM.render(
        <Concierge />,
        document.getElementById('content')
    )
}

const styles: React.CSSProperties = {
    fontFamily: 'Helvetica',
    display: 'flex',
    flexFlow: 'column',
    height: '100vh'
}