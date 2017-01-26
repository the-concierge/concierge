import * as React from 'react';
import mergeToClass from '../merge-style';
import { backgroundColor } from '../common';

type CellParams = {
    text: any;
    columnStyles?: {};
}

const Cell = ({text, columnStyles }: CellParams) => (
    <td className={mergeToClass(tdStyle, columnStyles)}>
        {text}
    </td>
)

const tdStyle = {
    td: {
        'border-bottom': '1px solid #91d3fd',
        padding: '4px',
        height: '35px'
    }
}

export default Cell;