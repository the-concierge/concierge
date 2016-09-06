import dockerClient from '../dockerClient';
import * as getHost from '../hosts/get';
import * as stream from 'stream';
import Docker from 'dockerode-ts';

/**
 * Retrieve the logs from a Container
 */
export default function get(container: Concierge.Container): Promise<any> {
	var request = (client: Docker) => getLog(client, container);

	return getHost.one(container.host)
		.then((host: Concierge.Host) => dockerClient(host, 500))
		.then(request);
}

function getLog(client: Docker, container: Concierge.Container) {
	var promise = new Promise((resolve, reject) => {
		var output = '';
		var append = data => {
            var str = data.toString();
            if (str.slice(-6, -1) === 'GET /') return;
            
            output += str;
        }

		var callback = (error, dataStream) => {
			if (error) return reject(error);

			// Demulitplexing the stream removes control characters from the output
			var stdout = new stream.PassThrough();
			var stderr = new stream.PassThrough();
			client.modem.demuxStream(dataStream, stdout, stderr);

			stdout.on('data', append);
			stderr.on('data', append);
			dataStream.on('end', () => resolve(<any>output));
		}

		client.getContainer(container.dockerId)
			.logs({ follow: false, stdout: true, stderr: true }, callback); // ?
	});

	return promise;
}

