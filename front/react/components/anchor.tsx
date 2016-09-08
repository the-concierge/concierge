import * as React from 'react';
import {Link} from 'react-router';
import {StyleSheet, css} from 'aphrodite';

export default ({text, href}: { text: string, href: string }) => (
    <Link
        className={css(styles.anchor, styles.hover)}
        to={href}>
        {text}
    </Link>
)

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