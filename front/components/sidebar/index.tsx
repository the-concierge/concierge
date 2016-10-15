import * as React from 'react';
import Anchor from '../anchor';
import {sidebarColor} from '../common';

export default ({options}: { options: Array<{ text: string, href: string }> }) => (
    <div style={styles}>
        {
            options
                .map(({text, href}, key) => (
                    <p key={key}>
                        <Anchor href={href}>
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
