import getClient from '../dockerClient';

/**
 * Get the 'inspect' information of an Image
 */
export default async function getImageInfo(host: Concierge.Host, dockerImage: string) {
    try {
        const info = await getImageAsync(host, dockerImage);
        return info;
    }
    catch (ex) {
        throw ex;
    }
}

function getImageAsync(host: Concierge.Host, dockerImage: string) {
    const client = getClient(host).getImage(dockerImage);
    const promise = new Promise<any>((resolve, reject) => {
        setTimeout(() => reject(new Error('Unable to locate image. Request timed out')), 1000);
        client.inspect((error, data) => {
            if (error) return reject(error);
            resolve(data);
        });
    });
    return promise;
}