import getImages from './getImages';
import * as request from '../request';

/**
 * Determine whether an image is available on the registry
 */
export default async function hasImage(imageName: string) {
    var images = await getImages();

    return images.some(image => image === imageName);
}