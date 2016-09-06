import * as React from 'react';
import Header from '../header/index';
import * as DOM from 'react-dom';

const Concierge = () => (
    <div style={styles}>
        <div style={{ display: 'block' }}>
            <Header height={60} />
        </div>
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
}