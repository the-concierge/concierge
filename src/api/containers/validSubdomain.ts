/**
 * Is the subdomain valid
 * N.B. Some subdomains are reserved and cannot be used 
 */
import {get as getConfig} from '../configurations/get'


export default function isValid(subdomain: string) {
	return _isValid(subdomain);	
}

const _isValid = async((subdomain: string) => {
	const trimmedSubdomain = (subdomain || '').trim();
	const config = await(getConfig());

	const isSubdomainValid = SUBDOMAIN_TEST.test(trimmedSubdomain);
	if (!isSubdomainValid) return false;

	/**
	 * Subdomain blacklist is stored as a comma separated list
	 * E.g. "abc,def,ghi"
	 */

	const isBlacklisted = config.subdomainBlacklist
		.split(',')
		.map(str => str.trim())
		.every(banned => banned !== trimmedSubdomain);
	
	return isBlacklisted;
});

const SUBDOMAIN_TEST = /^([a-z0-9]{1}[a-z0-9\-]+[a-z0-9])$/;
