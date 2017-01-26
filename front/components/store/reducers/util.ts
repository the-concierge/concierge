export function addEntity<T extends Id>(entities: Array<T>, entity: T) {
    const existing = entities.find(c => c.id === entity.id);
    if (existing) {        
        Object.assign(existing, entity);
        return entities;
    }
    return entities.concat(entity);
}

export function removeEntity<T extends Id>(state: AppState, entities: Array<T>, entityId: string | number) {
    const filtered = entities.filter(entity => entity.id !== entityId);
    return filtered;
}

type Id = { id?: string | number }