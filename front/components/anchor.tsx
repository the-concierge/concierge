import * as React from 'react';
import { Link } from 'react-router';
import { StyleSheet, css } from 'aphrodite';

type AnchorOpts = { text?: string, href: string, children?: any }
export default ({text, href, children}: AnchorOpts) => {
    return (
        <Link
            className={css(styles.anchor, styles.hover)}
            to={href}>
            {text || children}
        </Link>
    )
}

let styles = StyleSheet.create({
    anchor: {
        color: 'white',
        textDecoration: 'none',
    },
    hover: {
        ':hover': {
            textDecoration: 'underline'
        }
    }
});