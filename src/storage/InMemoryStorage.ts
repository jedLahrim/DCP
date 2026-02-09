import { IStorageProvider } from '../interfaces';

/**
 * In-Memory Storage Provider for testing and fallback
 */
export class InMemoryStorage implements IStorageProvider {
    private store: Map<string, any> = new Map();

    async init(): Promise<void> {
        // No-op for in-memory
        return;
    }

    async get<T>(key: string): Promise<T | null> {
        return this.store.get(key) || null;
    }

    async put<T>(key: string, value: T): Promise<void> {
        this.store.set(key, value);
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async list(prefix?: string): Promise<string[]> {
        const keys = Array.from(this.store.keys());
        if (prefix) {
            return keys.filter((k) => k.startsWith(prefix));
        }
        return keys;
    }
}
