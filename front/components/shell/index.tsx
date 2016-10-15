import * as React from 'react';
import Header from '../header/index';
import Sidebar from '../sidebar/index';
import Content from '../content/index';
import * as menus from './menu-data';
import Body from './body';

type ConciergeParams = {
    params: { category: string },
}
const Concierge = ({ params }: ConciergeParams) => (
    <div style={styles}>
        <Header items={menus.getTopLevel()} />
        <Body>
            <Sidebar options={menus.getOptions(params.category)} />
            <Content>
                {menus.getContent(params.category)}
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