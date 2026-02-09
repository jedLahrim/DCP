import { SyncQueue, ISyncOperation } from './SyncQueue';
import { IStorageProvider } from '../interfaces';

export class SyncEngine {
    private isSyncing = false;

    constructor(
        private storage: IStorageProvider,
        private queue: SyncQueue
    ) { }

    /**
     * Triggered when network comes online or manually.
     */
    async sync(): Promise<void> {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            console.log('[SyncEngine] Starting sync...');
            await this.processQueue();
            await this.pullChanges();
        } catch (error) {
            console.error('[SyncEngine] Sync failed:', error);
        } finally {
            this.isSyncing = false;
            console.log('[SyncEngine] Sync finished.');
        }
    }

    private async processQueue() {
        let op = await this.queue.peek();
        while (op) {
            try {
                console.log(`[SyncEngine] Processing operation: ${op.type} on ${op.key}`);
                // TODO: Send to backend API
                // await api.send(op);

                // If success, remove from queue
                await this.queue.dequeue();
            } catch (e) {
                console.error(`[SyncEngine] Failed to process operation ${op.id}`, e);
                // Break loop on error implementation of retry logic needed here
                break;
            }
            op = await this.queue.peek();
        }
    }

    private async pullChanges() {
        console.log('[SyncEngine] Pulling changes from server...');
        // TODO: Fetch from backend API
        // const changes = await api.fetchChanges(lastSyncTimestamp);
        // await this.applyChanges(changes);
    }
}
