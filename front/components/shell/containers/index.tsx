import * as React from 'react';
import ContainerList from './list';
import NewContainer from './new';
import { TopLevelItem } from '../navigation';

const item: TopLevelItem = {
    text: 'Containers',
    href: '/containers',
    content: () => <ContainerList />,
    options: []
}

item.options.push({
    text: 'Add Container',
    href: 'new',
    content: () => <NewContainer />
});

export default item;