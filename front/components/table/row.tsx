import * as React from 'react';
import mergeToClass from '../merge-style';
import { backgroundColor } from '../common';

type RowParams = {
    columns: Array<any>;
    rowStyles?: {};
    columnStyles?: {};
}
export default ({ columns, rowStyles, columnStyles }: RowParams) => (
    <tr className={mergeToClass(trStyle, rowStyles)}>
        {columns.map((column, index) => td(column, index, columnStyles))}
    </tr>
);

const td = (columnContent: any, index: number, columnStyles?: {}) => (
    <td className={mergeToClass(tdStyle, columnStyles)} key={index}>
        {columnContent}
    </td>
)

const trStyle = {

}

const tdStyle = {
    td: {
        'border-bottom': '1px solid #91d3fd',
        padding: '4px',        
        height: '35px'
    }
}
