import * as React from 'react';
import { Router, browserHistory, Route } from 'react-router';
import * as DOM from 'react-dom';
import Header from '../header/index';
import Sidebar from '../sidebar/index';
import Content from '../content/index';
import Hosts from './hosts';
import menuData, { MenuItem } from './menu-data';
import Anchor from '../anchor';

const Concierge = ({ content, sidebar, header }: { content: any, sidebar: any, header: () => JSX.Element }) => (
    <div style={styles}>
        <Header items={menuData.map(({name, href}) => ({ name, href }))} />
        <div style={{ display: 'flex', overflow: 'auto', flex: 1, justifyContent: 'flex-start' }}>
            <Sidebar content={sidebar} />
            <Content content={content} />
        </div>
    </div>
)

export function render() {
    DOM.render(
        <Router history={browserHistory}>
            <Route path="/" component={Concierge}>
                <Route path="/:category" components={{ content: Content, sidebar: Sidebar }} >
                    <Route path=":item" component={Item} />
                </Route>
            </Route>
        </Router>,
        document.getElementById('content')
    )
}

const Item = ({ category, item }: { category: any, item: any }) => (
    <div>
        <p>{category}</p>
        <p>{item}</p>
    </div>
)

const styles: React.CSSProperties = {
    fontFamily: 'Helvetica',
    display: 'flex',
    flexFlow: 'column',
    height: '100vh'
}