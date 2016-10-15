import { StyleSheet, css } from 'aphrodite';

export default function toClass(styles: {}, stylesToMerge: {} = {}) {
    return css(...spread(styles, stylesToMerge));
}

export function spread(styles: {}, stylesToMerge: {} = {}): Array<{ [index: string]: any }> {
    const leftStyles = StyleSheet.create(styles);
    const rightStyles = StyleSheet.create(stylesToMerge);
    const spread = (object: {}) => Object.keys(object).map(key => object[key]);

    const mergedStyles = [...spread(leftStyles), ...spread(rightStyles)];
    return mergedStyles;
}