import * as React from 'react';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Dashboard',
    href: '/dashboard',
    content: () => <div>Dashboard</div>,
    options: []
}

item.options.push({
    text: 'Performance',
    href: 'performance',
    content: () => <div>Performance monitoring</div>
});

item.options.push({
    text: 'Logs',
    href: 'logs',
    content: () => <div>Concierge Logs</div>
});

export default item;