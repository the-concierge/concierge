import * as React from 'react';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Administration',
    href: '/administration',
    content: () => <div>Administration</div>,
    options: []
}

export default item;