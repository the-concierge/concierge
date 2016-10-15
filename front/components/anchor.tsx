import * as React from 'react';
import { Link } from 'react-router';
import spreadStyle from './spread-style';
import { css } from 'aphrodite';

type AnchorOpts = { text?: string, href: string, children?: any, styles?: {} }
export default ({text, href, children, styles}: AnchorOpts) => {
    return (
        <Link
            className={css(...spreadStyle(style, styles))}
            to={href}>
            {text || children}
        </Link>
    )
}

const style = {
    anchor: {
        color: 'white',
        textDecoration: 'none',
    },
    hover: {
        ':hover': {
            textDecoration: 'underline'
        }
    }
};
