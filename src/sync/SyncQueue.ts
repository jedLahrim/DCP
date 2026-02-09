/**
 * Persistent Sync Queue for failed or offline operations.
 */
import { BrowserStorage } from '../storage/BrowserStorage';

export interface ISyncOperation {
    id: string; // UUID
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    key: string;
    payload: any;
    timestamp: number;
    retryCount: number;
}

export class SyncQueue {
    private queueKey = 'dcp_sync_queue';

    constructor(private storage: BrowserStorage) { }

    async enqueue(op: Omit<ISyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
        const operation: ISyncOperation = {
            ...op,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            retryCount: 0,
        };

        // In a real implementation, this would be an append to an array or separate object store.
        // For MVP using simple key-value storage approach:
        const currentQueue = await this.storage.get<ISyncOperation[]>(this.queueKey) || [];
        currentQueue.push(operation);
        await this.storage.put(this.queueKey, currentQueue);
    }

    async peek(): Promise<ISyncOperation | null> {
        const currentQueue = await this.storage.get<ISyncOperation[]>(this.queueKey) || [];
        return currentQueue.length > 0 ? currentQueue[0] : null;
    }

    async dequeue(): Promise<ISyncOperation | null> {
        const currentQueue = await this.storage.get<ISyncOperation[]>(this.queueKey) || [];
        if (currentQueue.length === 0) return null;

        const op = currentQueue.shift();
        await this.storage.put(this.queueKey, currentQueue);
        return op || null;
    }

    async size(): Promise<number> {
        const currentQueue = await this.storage.get<ISyncOperation[]>(this.queueKey) || [];
        return currentQueue.length;
    }
}
