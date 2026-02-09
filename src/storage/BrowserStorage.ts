import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { IStorageProvider } from '../interfaces';
import { ICryptoProvider } from '../security/CryptoProvider';

interface DCPDB extends DBSchema {
    documents: {
        key: string;
        value: {
            id: string;
            data: any; // Can be string (encrypted) or object
            metadata: {
                version: number;
                lastSyncedAt: number;
                isDirty: boolean;
                encrypted: boolean;
            };
        };
    };
    queue: {
        key: string;
        value: {
            id: string;
            operation: 'create' | 'update' | 'delete';
            payload: any;
            timestamp: number;
        };
    };
}

export class BrowserStorage implements IStorageProvider {
    private dbPromise: Promise<IDBPDatabase<DCPDB>> | null = null;
    private dbName = 'dcp-storage';
    private dbVersion = 1;

    constructor(private crypto?: ICryptoProvider) { }

    async init(): Promise<void> {
        if (typeof window === 'undefined' || !('indexedDB' in window)) {
            console.warn('IndexedDB not available, falling back or failing.');
            return;
        }

        this.dbPromise = openDB<DCPDB>(this.dbName, this.dbVersion, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('documents')) {
                    db.createObjectStore('documents', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('queue')) {
                    db.createObjectStore('queue', { keyPath: 'id' });
                }
            },
        });

        await this.dbPromise;
    }

    private async getDB() {
        if (!this.dbPromise) await this.init();
        if (!this.dbPromise) throw new Error('Database not initialized');
        return this.dbPromise;
    }

    async get<T>(key: string): Promise<T | null> {
        const db = await this.getDB();
        const result = await db.get('documents', key);

        if (!result) return null;

        if (this.crypto && result.metadata.encrypted && typeof result.data === 'string') {
            try {
                return await this.crypto.decrypt(result.data) as T;
            } catch (e) {
                console.error('Failed to decrypt data', e);
                return null;
            }
        }

        return result.data as T;
    }

    async put<T>(key: string, value: T): Promise<void> {
        const db = await this.getDB();
        const existing = await db.get('documents', key);

        let dataToStore: any = value;
        let isEncrypted = false;

        if (this.crypto) {
            dataToStore = await this.crypto.encrypt(value);
            isEncrypted = true;
        }

        const doc = {
            id: key,
            data: dataToStore,
            metadata: existing?.metadata || {
                version: 1,
                lastSyncedAt: Date.now(),
                isDirty: true,
                encrypted: isEncrypted,
            },
        };

        if (existing) {
            doc.metadata.isDirty = true;
            doc.metadata.encrypted = isEncrypted;
        }

        await db.put('documents', doc);
    }

    async delete(key: string): Promise<void> {
        const db = await this.getDB();
        await db.delete('documents', key);
    }

    async list(prefix?: string): Promise<string[]> {
        const db = await this.getDB();
        const keys = await db.getAllKeys('documents');
        const strKeys = keys as string[];

        if (prefix) {
            return strKeys.filter((k) => k.startsWith(prefix));
        }
        return strKeys;
    }
}
