import * as React from 'react';
import * as DOM from 'react-dom';


const Anchor = (props: { text: string, href: string }) => {

    return (
        <a
            style={styles}
            href={props.href}
            onMouseEnter={enter} // hover('bold')
            onMouseLeave={leave}>
            {props.text}
        </a>)
}

let styles: React.CSSProperties = {
    color: 'white',
    fontWeight: 'normal',
    textDecoration: 'none'
}
type MouseEvent = React.MouseEvent<any> & { target: HTMLAnchorElement }

const enter = (event: MouseEvent) => event.target.style.textDecoration = 'underline';
const leave = (event: MouseEvent) => event.target.style.textDecoration = 'none'; 

export default Anchor;