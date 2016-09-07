import * as React from 'react';

export default ({hostname, ip, operatingSystem, dockerVersion, storageSpace}: Concierge.APIHost) => (
    <tr>
        <td>${hostname}</td>
        <td>${ip}</td>
        <td>${operatingSystem}</td>
        <td>${dockerVersion}</td>
        <td>${storageSpace}</td>

    </tr>
)

type Updaters = {
    cpu: (value: string) => {},
}
