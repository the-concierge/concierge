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

menuItems.forEach(
    menuItem => {
        const category = menuItem.href.slice(1);
        double.override([category, ''], menuItem.content);
        menuItem.options.forEach(
            option => double.override([category, option.href], option.content)
        );
    }
);

export function getContent(category: string, item: string = '') {
    return double.dispatch(category, item);
}

export function getOptions(category: string) {
    return getItem(category).options;
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