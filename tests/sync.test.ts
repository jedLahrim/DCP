import { describe, it, expect, vi } from 'vitest';
import { SyncQueue } from '../src/sync/SyncQueue';
import { InMemoryStorage } from '../src/storage/InMemoryStorage';

// Mock BrowserStorage structure with InMemoryStorage for testing
class MockStorage extends InMemoryStorage {
    // SyncQueue implementation explicitly imports BrowserStorage but uses it like IStorageProvider
    // In a real app we would fix the dependency type.
}

describe('SyncQueue', () => {
    it('should enqueue and peek operations', async () => {
        const storage = new MockStorage();
        const queue = new SyncQueue(storage as any);

        await queue.enqueue({
            type: 'CREATE',
            key: 'doc:1',
            payload: { foo: 'bar' }
        });

        const op = await queue.peek();
        expect(op).toBeDefined();
        expect(op?.key).toBe('doc:1');
        expect(op?.type).toBe('CREATE');
    });

    it('should dequeue operations', async () => {
        const storage = new MockStorage();
        const queue = new SyncQueue(storage as any);

        await queue.enqueue({ type: 'CREATE', key: 'doc:1', payload: {} });
        await queue.enqueue({ type: 'UPDATE', key: 'doc:2', payload: {} });

        const op1 = await queue.dequeue();
        expect(op1?.key).toBe('doc:1');

        const op2 = await queue.peek();
        expect(op2?.key).toBe('doc:2');
    });
});
