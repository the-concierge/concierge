import * as React from 'react';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Archive',
    href: '/archive',
    content: () => <div>Archive</div>,
    options: []
}

export default item;