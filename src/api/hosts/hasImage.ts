import getImages from './getImages';
import getRegistry from '../registry/getRegistry';

/**
 * Determine if a Host has an image 
 */
export default async function hasImage(host: Concierge.Host, dockerImage: string) {
    if (!dockerImage) {
        throw new Error('[HASIMAGE] No Docker image supplied');
    }

    const images = await getImages(host);
    const isPresent = images.some(image => image.RepoTags.some(tag => tag === dockerImage));
    return isPresent;
}