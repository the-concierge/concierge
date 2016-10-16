import * as React from 'react';
import Anchor from '../anchor';
import { sidebarColor } from '../common';

type SidebarParams = {
    params: {
        root: string;
        options: Array<{ text: string, href: string }>;
    }
}
export default ({params}: SidebarParams) => (
    <div style={styles}>
        {
            params.options
                .map(({text, href}, key) => (
                    <p key={key}>
                        <Anchor href={params.root + '/' + href}>
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
