import * as React from 'react';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Images',
    href: '/images',
    content: () => <div>Administration</div>,
    options: []
}

item.options.push({
    text: 'Build Image',
    href: 'build',
    content: () => <div>Build Docker Image</div>
});

export default item;