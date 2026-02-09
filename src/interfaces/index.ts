/**
 * Core interface for DCP Configuration
 */
export interface IDCPConfig {
    syncIntervalMs: number;
    storageQuotaMb: number;
    retryStrategy: {
        maxRetries: number;
        initialDelayMs: number;
        backoffFactor: number;
    };
}

/**
 * Interface for Storage Provider
 */
export interface IStorageProvider {
    /**
     * Initialize the storage provider
     */
    init(): Promise<void>;

    /**
     * Get a value by key
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Set a value by key
     */
    put<T>(key: string, value: T): Promise<void>;

    /**
     * Delete a value by key
     */
    delete(key: string): Promise<void>;

    /**
     * List all keys implementation-specific prefix matching
     */
    list(prefix?: string): Promise<string[]>;
}

/**
 * Network Status
 */
export enum NetworkMode {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}

export interface INetworkMonitor {
    onStatusChange(callback: (status: NetworkMode) => void): void;
    getStatus(): NetworkMode;
}
