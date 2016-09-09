import * as React from 'react';

const items: MenuItem[] = [
    {
        name: 'Containers', href: '/containers',
        content: () => (<div>Containers...</div>),
        options: [
            { name: 'Add Container', href: '/containers/new' },
            { name: 'Refresh', href: '/containers' }
            // TODO: more...
        ]
    },
    {
        name: 'Hosts', href: '/hosts',
        content: () => (<div>Hosts...</div>),
        options: [
            { name: 'Add Host', href: '/hosts/new' },
            // TODO: more...
        ]
    },
    {
        name: 'Images', href: '/images',
        content: () => (<div>Images...</div>),
        options: [
            { name: 'Build Image', href: '/images/build' },
            { name: 'Refresh', href: '/images' },
            // TODO: more...
        ]
    },
    {
        name: 'Applications', href: '/applications',
        content: () => (<div>Applications...</div>),
        options: [
            { name: 'Add Application', href: '/applications/new' },
            { name: 'Refresh', href: '/applications' },
            // TODO: more...
        ]
    },
    {
        name: 'Administration', href: '/admin',
        content: () => (<div>Administration...</div>),
        options: [
            { name: 'Enable Editing', href: '/applications/new' },
            { name: 'Refresh', href: '/applications' },
            // TODO: more...
        ]
    },
    {
        name: 'Archive', href: '/archive',
        content: () => (<div>Archive...</div>),
        options: [
        ]
    },
]


export default items;

export interface MenuItem {
    name: string;
    href: string;
    content: () => JSX.Element;
    options: Array<{
        name: string;
        href: string;
    }>
}

// Legacy...
const navItems = [
    ['Hosts', '/hosts'],
    ['Containers', '/containers'],
    ['Images', '/react/images'],
    ['Applications', '/applications'],
    ['Administration', '/admin'],
    ['Archive', '/archive']
]