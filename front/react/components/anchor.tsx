import * as React from 'react';
import * as DOM from 'react-dom';


const Anchor = (props: { text: string, href: string }) => {

    return (
        <a
            style={styles}
            href={props.href}
            onMouseEnter={hover('underline')} // hover('bold')
            onMouseLeave={hover('none')}>
            {props.text}
        </a>)
}

let styles: React.CSSProperties = {
    color: 'white',
    fontWeight: 'normal',
    textDecoration: 'none'
}

const hover = (state: 'underline' | 'none') => (event: React.MouseEvent<any>) => {
    const target = event.target as HTMLAnchorElement;
    target.style.textDecoration = state;
} 

export default Anchor;