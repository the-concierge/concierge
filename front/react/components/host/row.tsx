import * as React from 'react';

export default (props: Concierge.APIHost) => (
    <tr>
        <td>${props.hostname}</td>
        <td>${props.ip}</td>
        <td>${props.operatingSystem}</td>
        <td>${props.dockerVersion}</td>
        <td>${props.storageSpace}</td>

    </tr>
)

type Updaters = {
    cpu: (value: string) => {},

}

const foo = ({bar}: { bar: string }) => {
    return (
        {bar}
    )
}
foo({bar:'foo'})