import { INetworkMonitor, NetworkMode } from '../interfaces';

export enum NetworkQuality {
    OFFLINE = 'OFFLINE',
    POOR = 'POOR',
    MODERATE = 'MODERATE',
    GOOD = 'GOOD',
    EXCELLENT = 'EXCELLENT',
}

/**
 * Network Monitor with Quality Assessment
 */
export class NetworkMonitor implements INetworkMonitor {
    private currentStatus: NetworkMode = NetworkMode.ONLINE;
    private currentQuality: NetworkQuality = NetworkQuality.GOOD; // Default assumption
    private listeners: ((status: NetworkMode) => void)[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.updateStatus(NetworkMode.ONLINE));
            window.addEventListener('offline', () => this.updateStatus(NetworkMode.OFFLINE));
            this.currentStatus = navigator.onLine ? NetworkMode.ONLINE : NetworkMode.OFFLINE;

            // Initial probe
            if (this.currentStatus === NetworkMode.ONLINE) {
                this.probe();
            }
        }
    }

    onStatusChange(callback: (status: NetworkMode) => void): void {
        this.listeners.push(callback);
    }

    getStatus(): NetworkMode {
        return this.currentStatus;
    }

    getQuality(): NetworkQuality {
        return this.currentQuality;
    }

    /**
     * Simulates a network probe to determine quality.
     */
    async probe(): Promise<NetworkQuality> {
        if (this.currentStatus === NetworkMode.OFFLINE) {
            this.currentQuality = NetworkQuality.OFFLINE;
            return NetworkQuality.OFFLINE;
        }

        const start = Date.now();
        try {
            // MVP: Randomly assign quality for demo purposes or check navigator.connection
            // @ts-ignore
            const conn = navigator.connection;
            if (conn) {
                if (conn.saveData) return NetworkQuality.POOR;
                if (conn.effectiveType === '4g') return NetworkQuality.GOOD;
                if (conn.effectiveType === '3g') return NetworkQuality.MODERATE;
                if (conn.effectiveType === '2g') return NetworkQuality.POOR;
            }

            // Fallback simulation for tests/demo
            this.currentQuality = NetworkQuality.GOOD;
            return NetworkQuality.GOOD;

        } catch (e) {
            return NetworkQuality.POOR;
        }
    }

    private updateStatus(status: NetworkMode) {
        if (this.currentStatus !== status) {
            this.currentStatus = status;
            if (status === NetworkMode.OFFLINE) {
                this.currentQuality = NetworkQuality.OFFLINE;
            } else {
                this.probe().then(q => this.currentQuality = q);
            }
            this.listeners.forEach((listener) => listener(status));
        }
    }
}
