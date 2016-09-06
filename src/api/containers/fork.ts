import leastLoadedHost from '../hosts/getLeastLoaded';
import getVolume from './getVolume';
import injectVolume from './injectVolume';
import makeDirectory from '../ssh/makeDirectory';
import getVolumePath from '../hosts/volumePath';
import createContainer from './create';
import * as codes from '../../types/codes';
import NewContainerType = codes.NewContainerType;

/**
 * Create a new container with the same variant and volume of another container
 */
export default async((container: Concierge.Container, newContainer: Concierge.NewContainer) => {
    let volume = await(getVolume(container));
    let forkHost = await(leastLoadedHost());
    newContainer.host = forkHost.hostname;

    await(injectVolume(newContainer as Concierge.Container, volume));
    return await(createContainer(newContainer, NewContainerType.Fork));
});