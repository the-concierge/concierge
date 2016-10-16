import * as React from 'react';
import containers from './containers/index';
import hosts from './hosts/index';
import administration from './administration/index';
import applications from './applications/index';
import archive from './archive/index';
import dashboard from './dashboard/index';
import images from './images/index';
import multimethod from '../multimethod';

const menuItems = [
    dashboard,
    containers,
    hosts,
    images,
    applications,
    administration,
    archive
];

export function getContent(category: string, item: string = '') {
    try {
        return double.dispatch(category, item);
    }
    catch (ex) {
        // Ambiguous call
        // Let's fall back to the category
        try {
            return double.dispatch(category, '');
        }
        catch (ex) {
            // Or return a 404?
            return dashboard.content();
        }
    }
}

export function getOptions(category: string) {
    const root = getItem(category).href;
    const options = getItem(category).options;
    return {
        root,
        options
    }
}

export function getItem(category: string): TopLevelItem {
    return menuItems.find(item => item.href.indexOf(category) >= 0) || dashboard;
}

export function getTopLevel() {
    const categories = menuItems.map(({text, href}) => ({ text, href }));
    return categories;
}

const double = multimethod<JSX.Element, string>(
    {
        name: 'category item',
        params: [
            {
                name: 'category',
                isa: (special, general) => special === general || (!special && general === 'dashboard')
            },
            {
                name: 'item',
                isa: (special, general) => special === general
            }
        ]
    }
);

menuItems.forEach(
    menuItem => {
        const category = menuItem.href.slice(1);
        double.override([category, ''], menuItem.content);
        menuItem.options.forEach(
            option => double.override([category, option.href], option.content)
        );
    }
);

export default menuItems;

export interface TopLevelItem {
    text: string;
    href: string;
    content: () => JSX.Element;
    options: Array<MenuItem>
}

export interface MenuItem {
    text: string;
    href: string;
    content?: () => JSX.Element;
}