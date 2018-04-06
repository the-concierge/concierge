import getImages from './getImages'

/**
 * Determine whether an image is available on the registry
 */
export default async function hasImage(imageName: string) {
  let images = await getImages()

  return images.some(image => image === imageName)
}
