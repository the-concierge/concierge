import * as React from 'react';
import { Router, browserHistory, Route } from 'react-router';
import * as DOM from 'react-dom';
import Header from '../header/index';
import Sidebar from '../sidebar/index';
import Content from '../content/index';
import Hosts from './hosts';

const Concierge = ({ content, sidebar }: { content: any, sidebar: any }) => (
    <div style={styles}>
        <Header height={48} />
        <div style={{ display: 'flex', overflow: 'auto', flex: 1, justifyContent: 'flex-start' }}>
            <Sidebar content={sidebar} />
            <Content content={content} />            
        </div>
    </div>
)

export function render() {
    DOM.render(
        <Router history={browserHistory}>
            <Route path="/react/index.html" component={Concierge}>
                <Route path="/react/hosts" components={{ content: Hosts, sidebar: null }}>
                </Route>
            </Route>
        </Router>,
        document.getElementById('content')
    )
}

const styles: React.CSSProperties = {
    fontFamily: 'Helvetica',
    display: 'flex',
    flexFlow: 'column',
    height: '100vh'
}