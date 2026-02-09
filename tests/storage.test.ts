import { describe, it, expect } from 'vitest';
import { InMemoryStorage } from '../src/storage/InMemoryStorage';

describe('InMemoryStorage', () => {
    it('should store and retrieve values', async () => {
        const storage = new InMemoryStorage();
        await storage.put('key1', 'value1');
        const value = await storage.get('key1');
        expect(value).toBe('value1');
    });

    it('should return null for missing keys', async () => {
        const storage = new InMemoryStorage();
        const value = await storage.get('missing');
        expect(value).toBeNull();
    });

    it('should delete values', async () => {
        const storage = new InMemoryStorage();
        await storage.put('key1', 'value1');
        await storage.delete('key1');
        const value = await storage.get('key1');
        expect(value).toBeNull();
    });

    it('should list keys with prefix', async () => {
        const storage = new InMemoryStorage();
        await storage.put('user:1', 'Alice');
        await storage.put('user:2', 'Bob');
        await storage.put('post:1', 'Hello');

        const users = await storage.list('user:');
        expect(users).toHaveLength(2);
        expect(users).toContain('user:1');
        expect(users).toContain('user:2');
    });
});
