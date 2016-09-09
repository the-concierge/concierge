import * as React from 'react';
import { Link } from 'react-router';
import Anchor from '../anchor';

export default ({brandName}: { brandName: string }) => (
    <div style={styles}>
        <Anchor href='/'>
            <span style={{ marginLeft: 10 }}>{brandName}</span>
        </Anchor>
    </div>
)

const styles = {
    width: 220,
    fontSize: '1.4em',
    textShadow: '1px 1px 1px rgba(0, 0, 0, 0, 3)',
    color: '#ccc'
}