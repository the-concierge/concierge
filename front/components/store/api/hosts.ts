export function all(): Promise<Concierge.APIHost[]> {
    return fetch('/api/hosts').then(res => res.json());
}

export function one(id: string | number): Promise<Concierge.APIHost> {
    return fetch(`/api/hosts/${id}`).then(res => res.json());
}