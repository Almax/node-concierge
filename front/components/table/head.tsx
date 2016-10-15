import * as React from 'react';
import mergeToClass from '../merge-style';
import { backgroundColor } from '../common';

type HeadParams = {
    headings: any[];
    rowStyles?: {};
    columnStyles?: {};
}
export default ({ headings, rowStyles, columnStyles }: HeadParams) => (
    <tr className={mergeToClass(trStyle, rowStyles)}>
        {headings.map((head, index) => th(head, index, columnStyles))}
    </tr>
);

const th = (head: any, index: number, styles?: {}) => (
    <th className={mergeToClass(thStyle, styles)} key={index}>
        {head}
    </th>
)

const trStyle = {

}

const thStyle = {
    th: {
        height: '35px',
        'text-align': 'left',
        color: backgroundColor,
        background: '#c3e7f3',
        'border-top': '2px solid #5ebffd',
        'border-bottom': '2px solid #5ebffd',
        padding: '4px',
        'font-size': '1.2em',
        'font-weight': 'bold'
    }
}
