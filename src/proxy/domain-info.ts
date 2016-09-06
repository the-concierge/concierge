export default function getDomainInfo(host: string) {
    if (!host) return { subdomain: '', domain: '' };
    var fullDomain = host.replace('https://', '').replace('http://', '').split(':')[0]; // Remove any port number

    var split = fullDomain.split('.');

    var subdomain = split[0].toLocaleLowerCase();
    var domain = split.slice(1).join('.').toLocaleLowerCase();

    return {
        subdomain: subdomain,
        domain: domain
    };
}