import * as React from 'react';
import { Router, browserHistory, Route } from 'react-router';
import * as DOM from 'react-dom';
import Concierge from './shell/index';
import { Provider } from 'react-redux';
import Sidebar from './sidebar/index';
import Content from './content/index';
import store from './store/index';

export default function render() {
    DOM.render(
        <Provider store={store}>
            <Router history={browserHistory}>
                <Route path="/" component={Concierge}>
                    <Route path="/:category" components={{ content: Content, sidebar: Sidebar }} >
                        <Route path=":item" component={Item} />
                    </Route>
                </Route>
            </Router>
        </Provider>,
        document.getElementById('content')
    )
}

const Item = ({ category, item }: { category: any, item: any }) => (
    <div>
        <p>{category}</p>
        <p>{item}</p>
    </div>
)