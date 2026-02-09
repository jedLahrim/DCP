/**
 * DCP Network Layer Specification
 * Handles network detection, quality assessment, and adaptive mode switching.
 */

export enum NetworkMode {
  ONLINE_AGGRESSIVE = 'ONLINE_AGGRESSIVE', // WiFi/High-speed
  ONLINE_CONSERVATIVE = 'ONLINE_CONSERVATIVE', // Cellular/Limited
  OFFLINE = 'OFFLINE',
}

export interface INetworkMetrics {
  latencyMs: number;
  bandwidthMbps: number;
  packetLossRate: number;
  timestamp: Date;
}

export interface INetworkProbe {
  /**
   * Performs a lightweight probe to determine current network quality.
   */
  probe(): Promise<INetworkMetrics>;
  
  /**
   * Listen for changes in connectivity.
   */
  onStatusChange(callback: (mode: NetworkMode) => void): void;
}

/**
 * Smart Fetching Strategy Implementation
 */
export class DCPNetworkManager {
  private currentMode: NetworkMode = NetworkMode.OFFLINE;
  private metrics: INetworkMetrics[] = [];

  constructor(private probe: INetworkProbe) {}

  public async updateState() {
    const latest = await this.probe.probe();
    this.metrics.push(latest);
    
    // Logic to determine mode
    if (latest.bandwidthMbps > 10 && latest.latencyMs < 100) {
      this.currentMode = NetworkMode.ONLINE_AGGRESSIVE;
    } else if (latest.bandwidthMbps > 0) {
      this.currentMode = NetworkMode.ONLINE_CONSERVATIVE;
    } else {
      this.currentMode = NetworkMode.OFFLINE;
    }
  }

  public getMode(): NetworkMode {
    return this.currentMode;
  }
}

/**
 * Background Sync Strategy (Service Worker / Task Runner context)
 */
export interface IBackgroundSyncManager {
  registerSyncTask(tag: string, options: SyncOptions): Promise<void>;
  cancelAll(): Promise<void>;
}

export interface SyncOptions {
  minBatteryLevel: number;
  requireUnmetered: boolean;
  priority: number;
}
