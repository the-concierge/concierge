import * as React from 'react';
import mergeToClass from '../merge-style';

type TableParams = {
    styles?: {};
    children?: any;
}
export default ({ styles, children }: TableParams) => (
    <table className={mergeToClass(tableStyles, styles)}>
        {children}
    </table>
)

const tableStyles = {
    table: {
        width: '100%',
        'border-spacing': '0'
    }
}