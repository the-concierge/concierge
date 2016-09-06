import * as SSH2 from 'ssh2';

/**
 * Create an instance of a connect SSH client ready for consumption
 */
export default function getClient(host: Concierge.Host): Promise<any> {
	var client = new SSH2.Client();

	var settings: any = {
		host: host.hostname,
		port: host.sshPort,
		username: host.sshUsername
	};

	var hasPassword = host.privateKey.length < 30;

	if (hasPassword) settings.password = host.privateKey;
	else settings.privateKey = host.privateKey;

	client.connect(settings);

	var promise = new Promise((resolve, reject) => {
		client.on('ready', () => {
			resolve(client);
		});
		
		client.on('error', error => {
			reject('[SSH] ' + error);
		});
	});

	return promise;
}