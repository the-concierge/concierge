import * as React from 'react';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Applications',
    href: '/applications',
    content: () => <div>Applications</div>,
    options: []
};

item.options.push({
    text: 'Add Application',
    href: 'new',
    content: () => <div>Create new Application</div>
});

export default item;