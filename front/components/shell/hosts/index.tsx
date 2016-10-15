import * as React from 'react';
import HostList from './list';
import NewHost from './new';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Hosts',
    href: '/hosts',
    content: () => <HostList />,
    options: []
}

item.options.push({
    text: 'Add Host',
    href: 'new',
    content: () => <NewHost />
});

export default item;
