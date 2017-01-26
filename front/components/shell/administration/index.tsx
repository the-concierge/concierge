import * as React from 'react';
import ConfigurationList from './list';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Administration',
    href: '/administration',
    content: () => <ConfigurationList />,
    options: []
}

export default item;