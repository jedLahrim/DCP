import {IDCPConfig, IStorageProvider, NetworkMode} from '../interfaces';
import {InMemoryStorage} from '../storage/InMemoryStorage';
import {BrowserStorage} from '../storage/BrowserStorage';
import {NetworkMonitor} from '../network/NetworkMonitor';
import {SyncQueue} from '../sync/SyncQueue';
import {SyncEngine} from '../sync/SyncEngine';
import {ResourceManager} from '../resources/ResourceManager';

/**
 * Core DCP Client
 */
export class DCPClient {
    storage: IStorageProvider;
    private config: IDCPConfig;
    private readonly network: NetworkMonitor; // Use concrete class to access getQuality
    private syncEngine: SyncEngine;
    private readonly syncQueue: SyncQueue;
    private resourceManager: ResourceManager;

    constructor(config: IDCPConfig) {
        this.config = config;

        // Choose storage based on environment
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
            this.storage = new BrowserStorage();
        } else {
            this.storage = new InMemoryStorage();
        }

        this.network = new NetworkMonitor();

        // Initialize Sync Components
        this.syncQueue = new SyncQueue(this.storage as any);
        this.syncEngine = new SyncEngine(this.storage, this.syncQueue);
        this.resourceManager = new ResourceManager(this.network, this.storage);
    }

    public async init(): Promise<void> {
        await this.storage.init();

        this.network.onStatusChange((status) => {
            console.log(`[DCP] Network status changed to: ${status}`);
            if (status === NetworkMode.ONLINE) {
                this.sync();
            }
        });

        console.log('[DCP] Client initialized with storage:', this.storage.constructor.name);
    }

    public async sync(): Promise<void> {
        if (this.network.getStatus() === NetworkMode.OFFLINE) {
            console.log('[DCP] Offline, skipping sync');
            return;
        }
        await this.syncEngine.sync();
    }

    /**
     * Hint to the DCP engine about current user route/context to trigger optimization.
     */
    public async routeChanged(route: string): Promise<void> {
        await this.resourceManager.optimizeForRoute(route);
    }

    public getStorage(): IStorageProvider {
        return this.storage;
    }

    public getNetworkMonitor(): NetworkMonitor {
        return this.network;
    }
}
