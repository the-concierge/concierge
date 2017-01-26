import * as React from 'react';
import mergeToClass from '../merge-style';
import { backgroundColor } from '../common';

type HeadParams = {
    heading: string;
    rowStyles?: {};
    columnStyles?: {};
}
export default ({ heading, rowStyles, columnStyles }: HeadParams) => (
    <th className={mergeToClass(thStyle, rowStyles)}>
        {heading}
    </th>
);

const thStyle = {
    th: {
        height: '35px',
        'text-align': 'left',
        color: backgroundColor,
        background: '#fff',
        'border-top': '1px solid #5ebffd',
        'border-bottom': '1px solid #5ebffd',
        padding: '4px',
        'font-size': '1.2em',
        'font-weight': 'bold'
    }
}
