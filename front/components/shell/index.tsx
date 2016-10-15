import * as React from 'react';
import Header from '../header/index';
import Sidebar from '../sidebar/index';
import Content from '../content/index';
import * as menus from './navigation';
import Body from './body';

type ConciergeParams = {
    params: {
        category: string;
        item?: string;
    },
}
const Concierge = ({ params }: ConciergeParams) => (
    <div style={styles}>
        <Header items={menus.getTopLevel()} />
        <Body>
            <Sidebar root={menus.getItem(params.category).href} options={menus.getOptions(params.category)} />
            <Content>
                {menus.getContent(params.category, params.item)}
            </Content>
        </Body>
    </div>
);

export default Concierge;

const styles: React.CSSProperties = {
    fontFamily: 'Helvetica',
    display: 'flex',
    flexFlow: 'column',
    height: '100vh'
}