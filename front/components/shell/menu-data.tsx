import * as React from 'react';

const items: MenuItem[] = [
    {
        text: 'Containers', href: '/containers',
        content: () => (<div>Containers...</div>),
        options: [
            { text: 'Add Container', href: 'new' },
            // TODO: more...
        ]
    },
    {
        text: 'Hosts', href: '/hosts',
        content: () => (<div>Hosts...</div>),
        options: [
            { text: 'Add Host', href: 'new' },
            // TODO: more...
        ]
    },
    {
        text: 'Images', href: '/images',
        content: () => (<div>Images...</div>),
        options: [
            { text: 'Build Image', href: 'build' },
            { text: 'Refresh', href: '/images' },
            // TODO: more...
        ]
    },
    {
        text: 'Applications', href: '/applications',
        content: () => (<div>Applications...</div>),
        options: [
            { text: 'Add Application', href: 'new' },
            // TODO: more...
        ]
    },
    {
        text: 'Administration', href: '/admin',
        content: () => (<div>Administration...</div>),
        options: [
            { text: 'Enable Editing', href: 'new' },
            // TODO: more...
        ]
    },
    {
        text: 'Archive', href: '/archive',
        content: () => (<div>Archive...</div>),
        options: [

        ]
    },
];

const fallback: MenuItem = {
    text: 'Dashboard', href: '/',
    content: () => <div>...</div>,
    options: [
        { text: 'Performance', href: 'performance' },
        { text: 'Logs', href: 'logs' },
    ]
}



export function getContent(category: string) {
    return getItem(category).content;
}

export function getOptions(category: string) {
    return getItem(category).options;
}

export function getItem(category: string): MenuItem {
    return items.find(item => item.href.indexOf(category) >= 0) || fallback;
}

export function getTopLevel() {
    return items.map(({text, href}) => ({ text, href }));
}

export default items;

export interface MenuItem {
    text: string;
    href: string;
    content: () => JSX.Element;
    options: Array<{
        text: string;
        href: string;
    }>
}