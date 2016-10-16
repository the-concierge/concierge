import * as React from 'react';
import Header from '../header/index';
import Sidebar from '../sidebar/index';
import Content from '../content/index';
import * as menus from './navigation';
import Body from './body';
import mergeToClass from '../merge-style';

type ConciergeParams = {
    styles?: {};
    params: {
        category: string;
        item?: string;
    },
}

const Concierge = ({ params, styles = {} }: ConciergeParams) => (
    <div className={mergeToClass(conciergeStyles, styles)}>
        <Header items={menus.getTopLevel()} />
        <Body>
            <Sidebar params={menus.getOptions(params.category)} />
            <Content>
                {menus.getContent(params.category, params.item)}
            </Content>
        </Body>
    </div>
);

export default Concierge;

const conciergeStyles: React.CSSProperties = {
    fontFamily: 'Helvetica',
    display: 'flex',
    flexFlow: 'column',
    height: '100vh'
}