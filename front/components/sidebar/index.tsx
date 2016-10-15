import * as React from 'react';
import Anchor from '../anchor';
import {sidebarColor} from '../common';

type SidebarParams = {
    root: string;
    options: Array<{ text: string, href: string }>;
}
export default ({root, options}: SidebarParams) => (
    <div style={styles}>
        {
            options
                .map(({text, href}, key) => (
                    <p key={key}>
                        <Anchor href={root + '/' + href}>
                            {text}
                        </Anchor>
                    </p>
                ))
        }
    </div>
)

const styles: React.CSSProperties = {
    padding: 10,
    minWidth: 200,
    float: 'left',
    backgroundColor: sidebarColor,
    color: '#fff'
}
