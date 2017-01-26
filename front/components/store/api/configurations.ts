export function all(): Promise<Concierge.Configuration[]> {
    return fetch('/api/configurations').then(res => res.json());
}
