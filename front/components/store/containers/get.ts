export function all(): Promise<Concierge.APIContainer[]> {
    return fetch('/api/containers').then(res => res.json());
}

export function one(id: string | number): Promise<Concierge.APIContainer> {
    return fetch(`/api/containers/${id}`).then(res => res.json());
}