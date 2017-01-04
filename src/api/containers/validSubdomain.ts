/**
 * Is the subdomain valid
 * N.B. Some subdomains are reserved and cannot be used 
 */
import { get as getConfig } from '../configurations/get'

export default async function isValid(subdomain: string) {
	const trimmedSubdomain = (subdomain || '').trim();
	const config = await getConfig();

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
}

const SUBDOMAIN_TEST = /^([a-z0-9]{1}[a-z0-9\-]+[a-z0-9])$/;
