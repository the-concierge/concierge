import * as React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Anchor = ({text, href}: { text: string, href: string }) => (
    <a
        className={css(styles.anchor, styles.hover)}
        href={href}>
        {text}
    </a>
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

export default Anchor;