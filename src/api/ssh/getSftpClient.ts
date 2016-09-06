import getClient from './getClient';

/**
 * Create an instance of an SFTP client 
 */
export default function get(host: Concierge.Host) {
	return getClient(host)
		.then(getSftpClient);
}

function getSftpClient(client) {
	var promise = new Promise((resolve, reject) => {
		client.sftp((error, sftp) => {
			if (error) return reject('[SFTP] Failed to get SFTP Client: ' + error);
			
			sftp.on('end', () => client.end());
			
			resolve(sftp);
		});
	});
	
	return promise;
}